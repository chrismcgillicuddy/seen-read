import React, { Component } from 'react';
import Slider from 'react-rangeslider';
import Moment from 'moment';

// This component is derived from react-rangeslider examples
// https://whoisandy.github.io/react-rangeslider/

export default class DateSlider extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      value: 1,
      reverseValue: 8,
      maxValue: 365,
      dateLabel: "JAN 01"
    }
  }

  componentDidMount() {
    const displayYear = this.props.displayYear;
    const maxValue = (Moment([displayYear]).isLeapYear()) ? 366 : 365;
    this.setState({maxValue});
  }


  handleChange = (value) => {
    const displayYear = this.props.displayYear;
    const dateLabel = Moment([displayYear]).dayOfYear(value).format("MMM DD");
    console.log("Slider date", dateLabel);
    this.setState({value});
    this.setState({dateLabel});
  }

  handleChangeReverse = (value) => {
    this.setState({
      reverseValue: value
    })
  }

  render () {
    const { value, reverseValue, maxValue, dateLabel } = this.state;
    console.log("maxValue",maxValue);
    return (
      <div className='slider orientation-reversed'>
          <div className='slider-vertical'>
            <Slider
              min={1}
              max={maxValue}
              value={value}
              reverse={true}
              tooltip={false}
              orientation='vertical'
              handleLabel={dateLabel}
              onChange={this.handleChange}
            />
            <div className='value'>{value}</div>
        </div>
      </div>
    )
  }
}
