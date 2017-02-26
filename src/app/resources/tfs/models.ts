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
    export interface IReleaseResult extends ng.resource.IResource<IReleaseResult> {
        count: number;
        value: IRelease[];
    }
    export interface IReleaseEnvironmentResult extends ng.resource.IResource<IReleaseEnvironmentResult> {
        environments: IReleaseEnvironment[]
        releaseDefinition: IReleaseDefinition;
        releases: IRelease[]
    }
    export interface IBuildDefinitionResult extends ng.resource.IResource<IBuildDefinitionResult> {
        count: number;
        value: IBuildDefinition[];
    }
    export interface IReleaseDefinitionResult extends ng.resource.IResource<IReleaseDefinitionResult> {
        count: number;
        value: IReleaseDefinition[];
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
        startTime: string;
        finishTime: string;
        duration: number;
        result: string;
        requestedFor: {
            displayName: string;
            imageUrl: string;
        },
        css: { //ugly
            width: string; height: string; left: string;
        }

    }
    export interface IBuildDefinition {
        id: string;
        name: string;
    }
    export interface IReleaseDefinition {
        id: string;
        name: string;
    }



    export interface IRelease {
        id: string;
        name: string;

        status: string;
        reason: string;
        environments: IReleaseEnvironment[]
    }

    export interface IReleaseEnvironment {
        id: number;
        name: string;
        rank: number;
        status: string;
        icon: string;
        lastReleases: IRelease[];
        definitionEnvironmentId: number;
        conditions: {
            conditionType: string;
            name: string;
            value: string;
        }[];

        preDeployApprovals: {
            status: string;
        }[];
        postDeployApprovals: {
            status: string;
        }[];
    }
}