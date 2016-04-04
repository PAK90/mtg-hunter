import * as React from "react";

const Select = require('react-select');

require('./MultiSelectStyles.scss')

const map = require('lodash/map');

export class MultiSelect extends React.Component{

  constructor(props){
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(selectedOptions = []) {
    this.props.setItems(map(selectedOptions, 'value'))
  }

  render() {
    const { placeholder, clearable, items, selectedItems, 
      disabled, showCount, setItems, valueRenderer, optionRenderer } = this.props

    const options = map(items, (option) => {
      let label = option.title || option.label || option.key
      if (showCount) label += ` (${option.doc_count}) `
      return { value: option.key, label, doc_count: option.doc_count}
    })

    return (
      <Select multi disabled={disabled}
        value={selectedItems}
        placeholder={placeholder}
        options={options}
        valueRenderer={valueRenderer}
        optionRenderer={optionRenderer}
        clearable={clearable}
        onChange={this.handleChange} />
    )
  }
}

MultiSelect.defaultProps = {
  items: [],
  selectedItems: [],
  clearable: true,
  valueRenderer: (v) => v.value,
  optionRenderer: (v) => v.label
}