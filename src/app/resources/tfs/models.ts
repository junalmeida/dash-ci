namespace DashCI.Resources.Tfs {
    export interface ITfsObject extends ng.resource.IResource<ITfsObject> {

    }

    export interface IProjectResult extends ng.resource.IResource<IProjectResult> {
        count: number;
        value: IProject[];
    }
    export interface IBuildResult extends ng.resource.IResource<IBuildResult> {
        count: number;
        value: IBuild[];
    }
    export interface IBuildDefinitionResult extends ng.resource.IResource<IBuildDefinitionResult> {
        count: number;
        value: IBuildDefinition[];
    }
    export interface IQueryResult extends ng.resource.IResource<IQueryResult> {
        count: number;
        value: IQuery[];
    }
    export interface IRunQueryResult extends ng.resource.IResource<IRunQueryResult> {
        workItems: IWorkItem[]
    }
    export interface IProject {
        id: string;
        name: string;
        description: string;
    }
    export interface IQuery {
        id: string;
        name: string;
        isFolder: boolean;
        children: IQuery[];
    }
    export interface IWorkItem {
        id: string;
        url: string;
    }
    export interface IBuild {
        id: string;
        buildNumber: string;
        sourceBranch: string;
        status: string;
        reason: string;
        finishTime: string;
        result: string;
        requestedFor: {
            displayName: string;
            imageUrl: string;
        }
    }
    export interface IBuildDefinition {
        id: string;
        name: string;
    }
}