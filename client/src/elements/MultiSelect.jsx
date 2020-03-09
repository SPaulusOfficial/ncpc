import React from 'react';

import { isEqual, sortBy } from 'lodash';
import PropTypes from 'prop-types';
import Select from 'react-select'; // SEE: https://github.com/JedWatson/react-select

class MultiSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isMulti: (props.controlType === 'Multi-Picklist'),
      options: props.options,
      value: props.value,
    };

    /*
     * EVENT HANDLERS
     */

    this.onChange = (selections) => {
      const { callback } = this.props;

      this.setState({ value: selections }, callback(selections, this.props, this.state));
    };

    /*
     * HELPER METHODS
     */

    this.sortOptions = () => {
      const { options, value } = this.props;

      const sortedOptions = sortBy(options, 'order');

      const labels = (value !== null) ? value.split(';') : [];

      const filteredValue = sortedOptions.filter((option) => labels.includes(option.value));

      const sortedValue = sortBy(filteredValue, 'order');

      sortedOptions.forEach((object) => {
        const modifiedObject = object;

        modifiedObject.key = object.id;
      });

      sortedValue.forEach((object) => {
        const modifiedObject = object;

        modifiedObject.key = object.id;
      });

      this.setState({ options: sortedOptions, value: sortedValue });
    };
  }

  /*
   * LIFECYCLE METHODS
   */

  componentDidMount() {
    this.sortOptions();
  }

  componentDidUpdate(prevProps) {
    const { options } = this.props;

    if (isEqual(options, prevProps.options) === false) {
      this.sortOptions();
    }
  }

  render() {
    const {
      helpText,
      id, label,
      placeholder,
    } = this.props;
    const { isMulti, options, value } = this.state;

    return (
      <div className="form-group">
        <label htmlFor={id}>{label}</label>
        <Select className="form-multiselect" closeMenuOnSelect={!isMulti} isClearable isMulti={isMulti} isSearchable={false} name={id} noOptionsMessag="No options" onChange={this.onChange} options={options} placeholder={placeholder} value={value} />
        {helpText ? <small className="form-text text-muted" id={`${id}_help`}>{helpText}</small> : ''}
      </div>
    );
  }
}

MultiSelect.defaultProps = {
  helpText: null,
  placeholder: '',
  value: null,
};

MultiSelect.propTypes = {
  callback: PropTypes.func.isRequired,
  controlType: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      order: PropTypes.number,
      value: PropTypes.string,
    }),
  ).isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        order: PropTypes.number,
        value: PropTypes.string,
      }),
    ),
  ]),
};

export default MultiSelect;
