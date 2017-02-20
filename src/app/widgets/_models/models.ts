/// <reference path="../../app.ts" />
namespace DashCI.Widgets {
    export interface ICodeDescription {
        code: string;
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
        editable: boolean;
    }

    export interface IDashBoardPage {
        id: string;
        widgets: IWidgetData[];
    }

    export interface IOptions {
        columns: number;
        rows: number;
    }


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