package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/google/go-github/v57/github"
	"golang.org/x/oauth2"
)

type ReleasesData struct {
	Releases        map[int]Release `json:"releases"`
	Years           []string        `json:"years"`
	PreReleaseCount []int           `json:"preReleaseCount"`
	GaReleaseCount  []int           `json:"gaReleaseCount"`
}

type Release struct {
	Type map[string][]int `json:"type"`
}

// year -> month -> workflow data
type (
	WorkflowsData map[int]map[int]*Workflow
	Workflow      struct {
		SuccessCount int `json:"successCount"`
		FailureCount int `json:"failureCount"`
		TotalCount   int `json:"totalCount"`
	}
)

const (
	dataDir = "data"
	org     = "rancher"
	repo    = "rancher"
)

func main() {
	writeWorkflowsData()
	// writeReleaseData()
	// writeWorkflows()
}

func writeWorkflowsData() {
	data, err := extractWorkflowsData()
	if err != nil {
		log.Fatal(err)
	}
	b, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	if err := os.WriteFile(dataDir+"/"+repo+"-monthly-workflows.json", b, 0644); err != nil {
		log.Fatal(err)
	}
}

func writeReleaseData() {
	data, err := extractReleasesData()
	if err != nil {
		log.Fatal(err)
	}
	b, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	if err := os.WriteFile(dataDir+"/"+repo+"-monthly-releases.json", b, 0644); err != nil {
		log.Fatal(err)
	}
}

func githubClient(ctx context.Context) (*github.Client, error) {
	token := os.Getenv("GITHUB_TOKEN")
	if token == "" {
		return nil, errors.New("GITHUB_TOKEN environment variable is required")
	}

	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	)
	tc := oauth2.NewClient(ctx, ts)
	return github.NewClient(tc), nil
}

func writeWorkflows() {
	ctx := context.Background()
	client, err := githubClient(ctx)
	if err != nil {
		log.Fatal(err)
	}
	w, err := workflows(ctx, client, org, repo)
	if err != nil {
		log.Fatal(err)
	}
	b, err := json.MarshalIndent(w, "", "  ")
	if err := os.WriteFile(dataDir+"/"+repo+"-workflows.json", b, 0644); err != nil {
		log.Fatal(err)
	}
}

func writeReleases() {
	ctx := context.Background()
	client, err := githubClient(ctx)
	if err != nil {
		log.Fatal(err)
	}
	r, err := releases(ctx, client, org, repo)
	if err != nil {
		log.Fatal(err)
	}
	b, err := json.MarshalIndent(r, "", "  ")
	if err := os.WriteFile(dataDir+"/"+repo+"-releases.json", b, 0644); err != nil {
		log.Fatal(err)
	}
}

func releases(ctx context.Context, client *github.Client, owner, repo string) ([]github.RepositoryRelease, error) {
	opt := &github.ListOptions{PerPage: 100}

	allReleases := []github.RepositoryRelease{}

	for {
		releases, resp, err := client.Repositories.ListReleases(ctx, owner, repo, opt)
		log.Printf("Releases: %d\n", len(releases))
		log.Printf("NextPage: %d\n", resp.NextPage)
		if err != nil {
			return nil, err
		}
		for _, release := range releases {
			allReleases = append(allReleases, *release)
		}
		if resp.NextPage == 0 {
			break
		}
		opt.Page = resp.NextPage
	}

	return allReleases, nil
}

func workflows(ctx context.Context, client *github.Client, owner, repo string) ([]github.WorkflowRun, error) {
	gopt := &github.ListOptions{PerPage: 100}
	opt := github.ListWorkflowRunsOptions{ListOptions: *gopt}

	allWorkflows := []github.WorkflowRun{}

	for {
		workflows, resp, err := client.Actions.ListWorkflowRunsByFileName(ctx, owner, repo, "push-release.yml", &opt)
		log.Printf("Releases: %d\n", *workflows.TotalCount)
		log.Printf("NextPage: %d\n", resp.NextPage)
		if err != nil {
			return nil, err
		}
		for _, workflow := range workflows.WorkflowRuns {
			allWorkflows = append(allWorkflows, *workflow)
		}
		if resp.NextPage == 0 {
			break
		}
		opt.Page = resp.NextPage
	}

	return allWorkflows, nil
}

func extractReleasesData() (ReleasesData, error) {
	data := ReleasesData{
		Releases: make(map[int]Release),
	}

	var releases []github.RepositoryRelease

	f, err := os.ReadFile(dataDir + "/" + repo + "-releases.json")
	if err != nil {
		return ReleasesData{}, err
	}

	if err := json.Unmarshal(f, &releases); err != nil {
		return ReleasesData{}, err
	}

	for _, release := range releases {
		releaseDate := release.GetCreatedAt().Time
		monthIndex := releaseDate.Month() - 1
		year := releaseDate.Year()

		if _, ok := data.Releases[year]; !ok {
			data.Releases[year] = Release{
				Type: make(map[string][]int),
			}
		}

		if data.Releases[year].Type["ga"] == nil {
			data.Releases[year].Type["ga"] = make([]int, 12)
		}
		if data.Releases[year].Type["pre"] == nil {
			data.Releases[year].Type["pre"] = make([]int, 12)
		}

		releaseType := "ga"

		if strings.Contains(release.GetTagName(), "-") {
			releaseType = "pre"
		}

		data.Releases[year].Type[releaseType][monthIndex] += 1
	}

	for year, release := range data.Releases {

		data.Years = append(data.Years, strconv.Itoa(year))

		for releaseType, month := range release.Type {
			yearTotal := 0
			for _, count := range month {
				yearTotal += count
			}
			if releaseType == "ga" {
				data.GaReleaseCount = append(data.GaReleaseCount, yearTotal)
			} else {
				data.PreReleaseCount = append(data.PreReleaseCount, yearTotal)
			}
		}
	}

	return data, nil
}

func extractWorkflowsData() (WorkflowsData, error) {
	data := WorkflowsData{}

	var workflows []github.WorkflowRun

	f, err := os.ReadFile(dataDir + "/" + repo + "-workflows.json")
	if err != nil {
		return WorkflowsData{}, err
	}

	if err := json.Unmarshal(f, &workflows); err != nil {
		return WorkflowsData{}, err
	}

	for _, workflow := range workflows {
		workflowDate := workflow.GetCreatedAt().Time
		month := int(workflowDate.Month())
		year := int(workflowDate.Year())

		if _, ok := data[year]; !ok {
			data[year] = make(map[int]*Workflow)
		}

		if _, ok := data[year][month]; !ok {
			data[year][month] = &Workflow{}
		}

		if workflow.GetConclusion() == "success" {
			data[year][month].SuccessCount += 1
		} else {
			data[year][month].FailureCount += 1
		}
		data[year][month].TotalCount += 1
	}
	return data, nil
}
