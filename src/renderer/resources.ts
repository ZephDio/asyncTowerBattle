
type ResourceType = { [key: string]: any }

export const Resources: ResourceType = {
    tower: {
        orange: {
            size: {
                width: 5,
                height: 5
            },
            resource: {
                shape: 'ellipse',
                color: 'orange'
            }
        },
        blue: {
            size: {
                width: 5,
                height: 10
            },
            resource: {
                shape: 'ellipse',
                color: 'blue'
            }
        },
        green: {
            size: {
                width: 4,
                height: 6
            },
            resource: {
                shape: 'rectangle',
                color: 'green'
            }
        },
    },
    unit: {
        soldier: {
            size: {
                width: 2,
                height: 2
            },
            resource: 'ellipse'
        },
    },
    path: {
        normal: {
            resource: '#C4A484'
        }
    },
    towerBase: {
        size: {
            width: 5,
            height: 5
        },
        resource: {
            shape: 'rectangle',
            color: '#3b3b3b'
        }
    }
}