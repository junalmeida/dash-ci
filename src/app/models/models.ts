/// <reference path="../app.ts" />
namespace DashCI.Models {
    export interface ICodeDescription {
        code: string;
        desc: string;
    }
    export interface IValueDescription {
        value: number;
        desc: string;
    }

    export interface IWidgetDescription {

        type: WidgetType;
        directive: string,
        title: string;
        desc: string;
    }

    export interface IWidgetScope extends ng.IScope {
        $element: JQuery,

        data: IWidgetData;
        globalOptions: IOptions;
        editable: boolean;
    }

    export interface IDashBoardPage {
        id: string;
        name: string;
        widgets: IWidgetData[];
    }

    export interface IOptions {
        columns: number;
        rows: number;

        tfs: {
            host: string;
            privateToken: string;
        },
        gitlab: {
            host: string;
            privateToken: string;
        },

        pages: IDashBoardPage[]
    }
    app.value("globalOptions", <IOptions>{});

    export interface IWidgetData {
        position: IRectangle;
        type: WidgetType;

        id: string;
        title: string;
        footer: boolean;
        header: boolean;
        color: string;
    }

    export interface IRectangle {
        top: number;
        left: number;
        width: number;
        height: number;

    }
}