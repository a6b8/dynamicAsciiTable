const config = {
    'placeholder': {
        'more': '...',
        'null': ''
    },
    'symbols': {
        'use': 'single',
        'single': {
            'vertical': '│',
            'horizontal': '─',
            'top_left': '┌',
            'top_center': '┬',
            'top_right': '┐',
            'center_left': '├',
            'center_center': '┼',
            'center_right': '┤',
            'bottom_left': '└',
            'bottom_center': '┴',
            'bottom_right': '┘'
        },
        'double': {
            'vertical': '║',
            'horizontal': '═',
            'top_left': '╔',
            'top_center': '╦',
            'top_right': '╗',
            'center_left': '╠',
            'center_center': '╬',
            'center_right': '╣',
            'bottom_left': '╚',
            'bottom_center': '╩',
            'bottom_right': '╝'
        }
    },
    'view': {
        'sortResults': 'ASC'
    },
    'table': {
        'header': {
            'alignment': {
                'use': 'center',
                'types': [ 'left', 'center', 'right' ]
            },
            'style': {
                'use': 'None',
                'types': [ 'UpperCase', 'LowerCase', 'Capitalize', 'None' ]
            }
        },
        'cell': {
            'padding': 1,
            'defaultAlignment': 'left'
        },
        'column': {
            'indexName': 'nr',
            'defaultLength': 15
        },
        'row': {
            'fixedLength': 4
        }
    }
}


export { config }