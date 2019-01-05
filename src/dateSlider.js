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

  handleChange = (dayNumber) => {
    // convert the day number to a month and day 'Jan 01'
    const displayYear = this.props.displayYear;
    const dateLabel = Moment([displayYear]).dayOfYear(dayNumber).format("MMM DD");

    // set highlight date for use in the media list
    let highlightDate = Moment([displayYear]).dayOfYear(dayNumber).format("MM/DD/YYYY");
    // console.log("highlightDate a:",highlightDate);
    highlightDate = Date.parse(new Date(highlightDate));
    // console.log("highlightDate b:", highlightDate);
    this.props.setMediaListHighlight(highlightDate);

    // set state
    this.setState({ value: dayNumber, dateLabel });
    // this.setState({dateLabel});
  }

  handleChangeReverse = (value) => {
    console.log("handleChangeReverse");
    this.setState({
      reverseValue: value
    })
  }

  render () {
    const { value, reverseValue, maxValue, dateLabel } = this.state;
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
