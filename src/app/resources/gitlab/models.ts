namespace DashCI.Resources.Gitlab {
    export interface IGitlabObject extends ng.resource.IResource<IGitlabObject> {

    }

    export interface IProject extends IGitlabObject {
        archived: boolean;
        name: string;
        name_with_namespace: string;
        path_with_namespace: string;
        id: number;

    }

    export interface IIssue extends IGitlabObject {

    }

    export interface IIssueCount extends IGitlabObject {
        count: number;
    }

    export interface IPipeline extends IGitlabObject {
        id: number;
        status: string;
        ref: string;
        tag: string;
        user: {
            name: string;
            avatar_url: string;
        };
        finished_at: string;
        duration: string;
        coverage: string;
    }

    export interface IGroup extends IGitlabObject {
        id: number;
        name: string;
    }

}