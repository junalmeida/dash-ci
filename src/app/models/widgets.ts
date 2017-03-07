/// <reference path="../app.ts" />

namespace DashCI.Models {
    export enum WidgetType {
        clock = 1,
        gitlabPipeline = 2,
        gitlabIssues = 3,
        tfsQueryCount = 4,
        labelTitle = 5,
        tfsBuild = 6,
        gitlabPipelineGraph = 7,
        tfsBuildGraph = 8,
        githubIssues = 9,
        tfsRelease = 10,
    }

    DashCI.app.constant("widgets", <IWidgetDescription[]>[
        {
            type: WidgetType.clock,
            title: "Clock",
            desc: "Current date and time."
        },
        {
            type: WidgetType.labelTitle,
            directive: "label-title",
            title: "Label",
            desc: "Static label to create semantic areas"
        },
        {
            type: WidgetType.githubIssues,
            directive: "github-issues",
            title: "GitHub - Issue Query",
            desc: "The count of an issue query against a repository."
        },
        {
            type: WidgetType.gitlabPipeline,
            directive: "gitlab-pipeline",
            title: "GitLab - Pipeline",
            desc: "The (almost) real time pipeline status for a branch."
        },
        {
            type: WidgetType.gitlabPipelineGraph,
            directive: "gitlab-pipeline-graph",
            title: "GitLab - Pipeline Graph",
            desc: "The pipeline graph for last N status for a branch."
        },
        {
            type: WidgetType.gitlabIssues,
            directive: "gitlab-issues",
            title: "GitLab - Issue Query",
            desc: "The count of an issue query against a project."
        },
        {
            type: WidgetType.tfsBuild,
            directive: "tfs-build",
            title: "TFS - Build",
            desc: "The (almost) real time build definition status for a project."
        },
        {
            type: WidgetType.tfsBuildGraph,
            directive: "tfs-build-graph",
            title: "TFS - Build Graph",
            desc: "The build graph for last N builds of a branch."
        },
        {
            type: WidgetType.tfsRelease,
            directive: "tfs-release",
            title: "TFS - Release Status",
            desc: "The release status for a release definition."
        },
        {
            type: WidgetType.tfsQueryCount,
            directive: "tfs-query-count",
            title: "TFS - Query Count",
            desc: "The count of a saved query against a project."
        },
    ]);
}