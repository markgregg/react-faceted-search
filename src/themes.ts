import { ReactFacetedSearchStyles } from './component/types'

export type Theme = 'none' | 'metallic'
export const themes: Theme[] = ['none', 'metallic']

export const metallicTheme: ReactFacetedSearchStyles = {
  reactFacetedSearch: {
    borderBottom: '#00468C 1px solid',
    borderRight: '#00468C 1px solid',
    borderTop: 'white 1px solid',
    borderLeft: 'white 1px solid',
    background: 'linear-gradient(to left top, #00468C, #C3CDE6)',
    color: 'white',
    minHeight: '31.5px',
  },
  input: {
    backgroundColor: 'transparent',
    color: 'white',
  },
  optionsList: {
    borderBottom: '#00468C 1px solid',
    borderRight: '#00468C 1px solid',
    borderTop: 'white 1px solid;',
    borderLeft: 'white 1px solid',
    background: 'linear-gradient(to left top, #00468C, #C3CDE6)',
    color: 'white',
  },
  activeOption: {
    background: '	#1560BD',
  },
  optionCategory: {
    background: '#00468C',
  },
  matcherView: {
    backgroundColor: '#16518d',
    borderRadius: '4px',
  },
  matcherToolTip: {
    borderBottom: '#00468C 1px solid',
    borderRight: '#00468C 1px solid',
    borderTop: 'white 1px solid;',
    borderLeft: 'white 1px solid',
    background: 'linear-gradient(to left top, #00468C, #C3CDE6)',
  },
  errorMessage: {
    borderBottom: '#00468C 1px solid',
    borderRight: '#00468C 1px solid',
    borderTop: 'white 1px solid;',
    borderLeft: 'white 1px solid',
  },
}

export const bodyStyleFromTheme = (
  theme: string,
): React.CSSProperties | undefined => {
  if (theme === 'metallic') {
    return {
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    }
  }
}

export const styleFromTheme = (
  theme: string,
): ReactFacetedSearchStyles | undefined => {
  if (theme === 'metallic') {
    return metallicTheme
  }
  return {
  }
}

export const styleCodeFromTheme = (theme: string): string => {
  if (theme === 'metallic') {
    return ` reactFacetedSearch: {
      borderBottom: '#00468C 1px solid',
      borderRight: '#00468C 1px solid',
      borderTop: 'white 1px solid;',
      borderLeft: 'white 1px solid',
      background: 'linear-gradient(to left top, #00468C, #C3CDE6)',
      color: 'white'
    },
    input: {
      backgroundColor: 'transparent',
      color: 'white'
    },
    optionsList: {
      borderBottom: '#00468C 1px solid',
      borderRight: '#00468C 1px solid',
      borderTop: 'white 1px solid;',
      borderLeft: 'white 1px solid',
      background: 'linear-gradient(to left top, #00468C, #C3CDE6)',
      color: 'white'
    },
    activeOption: {
      background: '	#1560BD',
    },
    optionCategory: {
      background: '#00468C'
    },
    matcherView: {
      backgroundColor: '#16518d',
      borderRadius: '4px'
    },
    matcherToolTip: {
      borderBottom: '#00468C 1px solid',
      borderRight: '#00468C 1px solid',
      borderTop: 'white 1px solid;',
      borderLeft: 'white 1px solid',
      background: 'linear-gradient(to left top, #00468C, #C3CDE6)',
    },
    errorMessage: {
      borderBottom: '#00468C 1px solid',
      borderRight: '#00468C 1px solid',
      borderTop: 'white 1px solid;',
      borderLeft: 'white 1px solid',
    }`
  }
  return ''
}

export const getAgGridStyle = (theme: string): any => {
  if (theme === 'metallic') {
    return {
      '--ag-foreground-color': 'white',
      '--ag-background-color': '#416488',
      '--ag-header-foreground-color': 'white',
      '--ag-header-background-color': '#16518d',
      '--ag-odd-row-background-color': '#2e5b87',
      '--ag-header-column-resize-handle-color': '#042e58',
    }
  }
  return {}
}
