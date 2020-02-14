import React from 'react';

import { isEqual, sortBy } from 'lodash';
import Select from 'react-select'; // SEE: https://github.com/JedWatson/react-select

class MultiSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isMulti: (props.controlType === 'Multi-Picklist') ? true : false,
      options: props.options,
      value: props.value
    }

    /*
     * EVENT HANDLERS
     */

    this.onChange = (selections, action) => {
      this.setState({ value:selections }, this.props.callback(selections, this.props, this.state));
    }

    /*
     * HELPER METHODS
     */

    this.sortOptions = () => {
      const sortedOptions = sortBy(this.props.options, 'order');

      const labels = (this.props.value !== null) ? this.props.value.split(';') : [];
      
      const value = sortedOptions.filter(option => labels.includes(option.value));

      const sortedValue = sortBy(value, 'order');

      sortedOptions.forEach(object => {
        object.key = object.id;
      });

      sortedValue.forEach(object => {
        object.key = object.id;
      });

      this.setState({ options:sortedOptions, value:sortedValue });
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  componentDidMount() {
    this.sortOptions();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (isEqual(this.props.options, prevProps.options) === false) {
      this.sortOptions();
    }
  }

  render() {
    return (
      <div className="form-group">
        <label htmlFor={this.props.id}>{this.props.label}</label>
        <Select className="form-multiselect" closeMenuOnSelect={!this.state.isMulti} isClearable={true} isMulti={this.state.isMulti} isSearchable={false} name={this.props.id} noOptionsMessag="No options" onChange={this.onChange} options={this.state.options} placeholder={this.props.placeholder} value={this.state.value} />
        {this.props.helpText ? <small className="form-text text-muted" id={this.props.id + '_help'}>{this.props.helpText}</small> : ''}
      </div>
    )
  }
}

export default MultiSelect;
