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
}