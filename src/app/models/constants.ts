/// <reference path="../app.ts" />

namespace DashCI.Models {

    DashCI.app.constant("colors", <ICodeDescription[]>[
        {
            code: "semi-transp",
            desc: "Semi Transparent"
        },
        {
            code: "transparent",
            desc: "Transparent"
        },
        {
            code: "red",
            desc: "Red"
        },
        {
            code: "green",
            desc: "Green"
        },
        {
            code: "deep-green",
            desc: "Deep Green"
        },
        {
            code: "turkoise",
            desc: "Turkoise"
        },
        {
            code: "purple",
            desc: "Purple"
        },
        {
            code: "pink",
            desc: "Pink"
        },
        {
            code: "blue",
            desc: "Blue"
        },
        {
            code: "amber",
            desc: "Amber"
        },
        {
            code: "orange",
            desc: "Orange"
        },
        {
            code: "brown",
            desc: "Brown"
        },
        {
            code: "grey",
            desc: "Grey"
        },
    ]);


    DashCI.app.constant("intervals", <IValueDescription[]>[
        {
            value: 10000,
            desc: "10 secs"
        },
        {
            value: 15000,
            desc: "15 secs"
        },
        {
            value: 20000,
            desc: "20 secs"
        },
        {
            value: 30000,
            desc: "30 secs"
        },
        {
            value: 60000,
            desc: "1 min"
        },
        {
            value: 120000,
            desc: "2 min"
        },
    ]);

    DashCI.app.constant("longIntervals", <IValueDescription[]>[
        {
            value: 30000,
            desc: "30 secs"
        },
        {
            value: 60000,
            desc: "1 min"
        },
        {
            value: 120000,
            desc: "2 min"
        },
        {
            value: 300000,
            desc: "5 min"
        },
        {
            value: 3600000,
            desc: "1 hr"
        },
    ]);


    DashCI.app.constant("buildCounts", <IValueDescription[]>[
        {
            value: 20,
            desc: "20 builds"
        },
        {
            value: 30,
            desc: "30 builds"
        },
        {
            value: 40,
            desc: "40 builds"
        }
    ]);
    DashCI.app.constant("aligns", <ICodeDescription[]>[
        {
            code: "center",
            desc: "Center"
        },
        {
            code: "left",
            desc: "Left"
        },
        {
            code: "right",
            desc: "Right"
        },
    ]);


    DashCI.app.constant("defaultBoards", <IOptions>{
        "columns": 30,
        "rows": 25,
        "tfs": null,
        "gitlab": {
            "host": "https://gitlab.com",
            "privateToken": "xcijrZB97fv9xQnCNsJc"
        },
        "github": [],
        "circleci": [],
        "custom": [],
        "pages": [
            {
                "id": "1",
                "name": "GitLab",
                "widgets": [
                    {
                        "type": 5,
                        "position": {
                            "left": 1,
                            "top": 1,
                            "width": 30,
                            "height": 2
                        },
                        "id": "6279",
                        "footer": false,
                        "header": false,
                        "title": "Dashboard Example",
                        "color": "transparent",
                        "align": "center"
                    },
                    {
                        "type": 7,
                        "position": {
                            "left": 12,
                            "top": 15,
                            "width": 12,
                            "height": 6
                        },
                        "id": "9834",
                        "footer": false,
                        "header": true,
                        "title": "All History",
                        "color": "transparent",
                        "ref": "",
                        "poolInterval": 30000,
                        "count": 20,
                        "project": 278964
                    },
                    {
                        "type": 2,
                        "position": {
                            "left": 1,
                            "top": 3,
                            "width": 11,
                            "height": 6
                        },
                        "id": "8e74",
                        "footer": false,
                        "header": false,
                        "title": "Master",
                        "color": "deep-green",
                        "refs": "master",
                        "poolInterval": 10000,
                        "project": 278964
                    },
                    {
                        "type": 2,
                        "position": {
                            "left": 1,
                            "top": 9,
                            "width": 11,
                            "height": 6
                        },
                        "id": "d83a",
                        "footer": false,
                        "header": false,
                        "title": "Use Templates Branch",
                        "color": "deep-green",
                        "refs": "use-templates",
                        "poolInterval": 10000,
                        "project": 278964
                    },
                    {
                        "type": 3,
                        "position": {
                            "left": 24,
                            "top": 3,
                            "width": 7,
                            "height": 6
                        },
                        "id": "63c8",
                        "footer": false,
                        "header": true,
                        "title": "Front End Bugs",
                        "color": "grey",
                        "labels": "frontend,bug",
                        "status": "opened",
                        "poolInterval": 10000,
                        "query_type": "projects",
                        "project": 278964,
                        "greaterThan": {
                            "value": 0,
                            "color": "red"
                        },
                        "lowerThan": {
                            "value": 1,
                            "color": "green"
                        }
                    },
                    {
                        "type": 3,
                        "position": {
                            "left": 24,
                            "top": 9,
                            "width": 7,
                            "height": 6
                        },
                        "id": "39d2",
                        "footer": false,
                        "header": true,
                        "title": "Back End Bugs",
                        "color": "grey",
                        "labels": "bug,backend",
                        "status": "opened",
                        "poolInterval": 30000,
                        "query_type": "projects",
                        "project": 278964,
                        "greaterThan": {
                            "value": 0,
                            "color": "turkoise"
                        },
                        "lowerThan": {
                            "value": 1,
                            "color": "green"
                        }
                    },
                    {
                        "type": 1,
                        "position": {
                            "left": 24,
                            "top": 15,
                            "width": 7,
                            "height": 11
                        },
                        "id": "7e73",
                        "footer": false,
                        "header": true,
                        "title": "Clock",
                        "color": "green"
                    },
                    {
                        "type": 5,
                        "position": {
                            "left": 1,
                            "top": 22,
                            "width": 22,
                            "height": 2
                        },
                        "id": "9665",
                        "footer": false,
                        "header": false,
                        "title": "This is an example of board using GitLab data",
                        "color": "transparent",
                        "align": "left"
                    },
                    {
                        "type": 5,
                        "position": {
                            "left": 1,
                            "top": 24,
                            "width": 23,
                            "height": 2
                        },
                        "id": "b1ee",
                        "footer": false,
                        "header": false,
                        "title": "Use the top toolbar to configure service tokens",
                        "color": "transparent",
                        "align": "left"
                    },
                    {
                        "type": 7,
                        "position": {
                            "left": 12,
                            "top": 9,
                            "width": 12,
                            "height": 6
                        },
                        "id": "6afd",
                        "footer": false,
                        "header": true,
                        "title": "Use Templates History",
                        "color": "transparent",
                        "ref": "use-templates",
                        "poolInterval": 30000,
                        "count": 20,
                        "project": 278964
                    },
                    {
                        "type": 7,
                        "position": {
                            "left": 12,
                            "top": 3,
                            "width": 12,
                            "height": 6
                        },
                        "id": "74ee",
                        "footer": false,
                        "header": true,
                        "title": "Master History",
                        "color": "transparent",
                        "ref": "master",
                        "poolInterval": 30000,
                        "count": 20,
                        "project": 278964
                    },
                    {
                        "type": 2,
                        "position": {
                            "left": 1,
                            "top": 15,
                            "width": 11,
                            "height": 6
                        },
                        "id": "49ee",
                        "footer": false,
                        "header": false,
                        "title": "All",
                        "color": "purple",
                        "refs": "",
                        "poolInterval": 10000,
                        "project": 278964
                    }
                ]
            }
        ]
    });
}