namespace DashCI.Resources.Custom {
    export interface ICount extends ng.resource.IResource<ICount> {
        count: number;
    }

    export interface IList extends ng.resource.IResource<IList> {
        count: number;
        list: any[];
    }

}