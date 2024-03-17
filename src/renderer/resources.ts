
type ResourceType = { [key: string]: any }

export const Resources : ResourceType  = {
    tower : {
        orange : {
            size :{
                width : 5,
                height: 5
            },
            resource : 'ellipse'
        },
        blue :  {
            size :{
                width : 5,
                height: 10
            },
            resource : 'ellipse'
        },
        green :  {
            size :{
                width : 4,
                height: 6
            },
            resource : 'rectangle'
        },
    },
    unit : {
        soldier : {
            size :{
                width : 2,
                height: 2
            },
            resource : 'ellipse'
        },
    },
    path : {
        normal : {
            resource : '#C4A484'
        }
    }
}