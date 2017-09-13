/// <reference path="../app.ts" />

namespace DashCI.Core {

    export class AddWidgetController implements ng.IController {
        public static $inject = ["$mdDialog", "widgets", "widgetcategories"];
        constructor(
            private $mdDialog: ng.material.IDialogService,
            public widgets: Models.IWidgetDescription[],
            public categories: Models.IEnumDescription<Models.WidgetCategory>[]
        ) { 
        }

        $onInit() { }

        public cancel() {
            this.$mdDialog.cancel();
        }

        public select(type: Models.WidgetType) {
            this.$mdDialog.hide(type);
        }
    }
}