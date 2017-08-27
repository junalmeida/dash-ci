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
        tfsQueryChart = 11,
        customCount = 12,
        customPostIt = 13,
        tfsPostIt = 14
    }
    export enum WidgetCategory {
        generic = 1,
        gitlab = 2,
        tfs = 3,
        github = 4,
        circleci = 5,
        custom = 6
    }

    DashCI.app.constant("widgetcategories", <IEnumDescription<WidgetCategory>[]>[
        {
            value: WidgetCategory.generic,
            desc: "Generic Widgets"
        },
        {
            value: WidgetCategory.gitlab,
            desc: "Gitlab Widgets"
        },
        {
            value: WidgetCategory.tfs,
            desc: "TFS/VSTS Widgets"
        },
        {
            value: WidgetCategory.github,
            desc: "Github Widgets"
        },
        {
            value: WidgetCategory.custom,
            desc: "Custom APIs"
        },
    ]);


    DashCI.app.constant("widgets", <IWidgetDescription[]>[
        {
            type: WidgetType.clock,
            title: "Clock",
            desc: "Current date and time.",
            category: WidgetCategory.generic
        },
        {
            type: WidgetType.labelTitle,
            directive: "label-title",
            title: "Label",
            desc: "Static label to create semantic areas",
            category: WidgetCategory.generic
        },
        {
            type: WidgetType.githubIssues,
            directive: "github-issues",
            title: "GitHub - Issue Query",
            desc: "The count of an issue query against a repository.",
            category: WidgetCategory.github
        },
        {
            type: WidgetType.gitlabPipeline,
            directive: "gitlab-pipeline",
            title: "GitLab - Pipeline",
            desc: "The (almost) real time pipeline status for a branch.",
            category: WidgetCategory.gitlab
        },
        {
            type: WidgetType.gitlabPipelineGraph,
            directive: "gitlab-pipeline-graph",
            title: "GitLab - Pipeline Graph",
            desc: "The pipeline graph for last N status for a branch.",
            category: WidgetCategory.gitlab
        },
        {
            type: WidgetType.gitlabIssues,
            directive: "gitlab-issues",
            title: "GitLab - Issue Query",
            desc: "The count of an issue query against a project.",
            category: WidgetCategory.gitlab
        },
        {
            type: WidgetType.tfsBuild,
            directive: "tfs-build",
            title: "TFS - Build",
            desc: "The (almost) real time build definition status for a project.",
            category: WidgetCategory.tfs
        },
        {
            type: WidgetType.tfsBuildGraph,
            directive: "tfs-build-graph",
            title: "TFS - Build Graph",
            desc: "The build graph for last N builds of a branch.",
            category: WidgetCategory.tfs
        },
        {
            type: WidgetType.tfsRelease,
            directive: "tfs-release",
            title: "TFS - Release Status",
            desc: "The release status for a release definition.",
            category: WidgetCategory.tfs
        },
        {
            type: WidgetType.tfsQueryCount,
            directive: "tfs-query-count",
            title: "TFS - Query Count",
            desc: "The count of a saved query against a project.",
            category: WidgetCategory.tfs
        },
        {
            type: WidgetType.tfsQueryChart,
            directive: "tfs-query-chart",
            title: "TFS - Query Chart",
            desc: "Shows the count of saved querys count at a chart.",
            category: WidgetCategory.tfs
        },
        {
            type: WidgetType.tfsPostIt,
            directive: "tfs-post-it",
            title: "TFS - Post It View",
            desc: "Shows 'PostIt' of the result of a query.",
            category: WidgetCategory.tfs
        },
        {
            type: WidgetType.customCount,
            directive: "custom-count",
            title: "Custom API Count",
            desc: "Shows the count of the result of a custom REST API.",
            category: WidgetCategory.custom
        },
        {
            type: WidgetType.customPostIt,
            directive: "custom-post-it",
            title: "Custom API Post It View",
            desc: "Shows 'PostIt' of the result of a custom REST API.",
            category: WidgetCategory.custom
        },
    ]);
}