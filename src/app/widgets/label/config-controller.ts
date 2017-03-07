
namespace DashCI.Widgets.Label {

    export class LabelConfigController implements ng.IController {
        public static $inject = ["$mdDialog", "colors", "aligns", "config"];
        constructor(
            private $mdDialog: ng.material.IDialogService,
            public colors: Models.ICodeDescription[],
            public aligns: Models.ICodeDescription[],
            public vm: ILabelWidgetData
        ) { 
            this.init();
        }

        private init() {
        }

        public ok() {
            this.$mdDialog.hide(true);
        }
    }
}