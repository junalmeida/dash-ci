namespace DashCI.Resources.Github {

    export interface IRepository extends ng.resource.IResource<IRepository> {
        id: number;
        name: string;
        full_name: string;
    }

    export interface IIssue extends ng.resource.IResource<IIssue> {

    }

    export interface ICount extends ng.resource.IResource<ICount> {
        count: number;
    }
}