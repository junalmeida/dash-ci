namespace DashCI.Resources.Tfs {
    export interface ITfsObject extends ng.resource.IResource<ITfsObject> {

    }

    export interface IProjectResult extends ng.resource.IResource<IProjectResult> {
        count: number;
        value: IProject[];
    }
    export interface ITeamResult extends ng.resource.IResource<ITeamResult> {
        count: number;
        value: ITeam[];
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
    export interface IReleaseDefinitionListResult extends ng.resource.IResource<IReleaseDefinitionListResult> {
        count: number;
        value: IReleaseDefinition[];
    }

    export interface IQueryResult extends ng.resource.IResource<IQueryResult> {
        count: number;
        value: IQuery[];
        children: IQuery[];
    }
    export interface IRunQueryResult extends ng.resource.IResource<IRunQueryResult> {
        workItems: IWorkItem[]
    }

    export interface IWorkItemsResult extends ng.resource.IResource<IWorkItemsResult> {
        count: number;
        value: IWorkItem[];
    }

    export interface IProject {
        id: string;
        name: string;
        description: string;
    }
    export interface ITeam {
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
        fields: {
            'System.Id': number;
            'System.WorkItemType': string;
            'System.State': string;
            'System.Title': string;
            'System.AssignedTo': string;
            'System.IterationPath': string;
        },
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
    export interface IReleaseDefinition extends ng.resource.IResource<IReleaseDefinition> {
        id: number;
        name: string;
        environments: IReleaseEnvironment[]
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
        release: IRelease;
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