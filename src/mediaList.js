import React from 'react';
import * as _ from 'lodash';
import Moment from 'moment';

const progressRadius = 30;

export default class MediaList extends React.Component {

  constructor(props){
    super(props);
  }

  componentDidMount() {
    const mediaListPanel = document.getElementById("list-panel");
    mediaListPanel.addEventListener('scroll', this.props.mediaListVisibility);
    mediaListPanel.addEventListener('scroll', this.updateRadialProgress);
    // mediaListPanel.addEventListener('scroll', _.debounce(this.updateRadialProgress, 50));
    // mediaListPanel.addEventListener('scroll', _.debounce(this.props.mediaListVisibility, 50));
    this.props.mediaListVisibility();
  }

  componentDidUpdate() {
    // this.props.mediaListVisibility();
    // window.addEventListener('scroll', _.debounce(this.updateRadialProgress, 200));
    // window.addEventListener('scroll', this.updateRadialProgress);
    // const mediaListContainer = document.getElementById("list-panel");
    // mediaListContainer.addEventListener('scroll', _.debounce(this.props.mediaListVisibility, 100));
    // mediaListContainer.addEventListener('scroll', this.props.mediaListVisibility, 100);
  }

  componentWillUnmount(){
    const mediaListPanel = document.getElementById("list-panel");
    mediaListPanel.removeEventListener('scroll', this.updateRadialProgress);
  }

  updateRadialProgress = (event) => {
    // move this radial progress setup
    let circumference = 2 * Math.PI * progressRadius;
    const mediaListContainer = document.getElementById("list-panel");;

    // let lastScrollY = window.scrollY;
    let clientHeight = document.documentElement.clientHeight;
    let scrollHeight = mediaListContainer.scrollHeight;
    let contentHeight = scrollHeight - clientHeight;
    let strokeDashArray = (mediaListContainer.scrollTop / contentHeight) * circumference;

    // update radial progress state with strokeDashArray
    // this.setState({radialProgress: strokeDashArray});
    this.props.setRadialProgress(strokeDashArray);
  }

  render() {
    const {data,
      yearsAvailable,
      displayYear,
      setDisplayYear,
      highlighted,
      highlightDate,
      setHighlight,
      mediaListVisibility,
      updateOnScreenItems,
      setRadialProgress} = this.props;
    let previousDate = '';
    let currentDate = '';
    let dateMatch = false;
    let itemDate = '';
    let newDate = true;
    let newDateClass = "new-date";
    let rowClass = '';
    let itemCSS = '';
    let dateClass = '';
    let dailyItems = '';

    // console.log("Media List", data);

    if (highlighted){
      // console.log("render() highlighted:",highlighted);
      // scrollToElement('#'+highlighted);
      var element = document.getElementById(highlighted);
      // console.log("highlighted element:",element);
      element.scrollIntoView({behavior: "smooth", block: "center"});
    }

    const yearNavItems = yearsAvailable.map((year) => {
      let yearEntry = "";
      let selectedClass ="";
      (year == this.props.displayYear)
        ? selectedClass = " selected"
        : selectedClass = "";
      yearEntry = <span className={"year"+selectedClass} onClick={() => this.props.setDisplayYear(year)}>{year}</span>
      return yearEntry;
    }, this);

    const yearNav = <div className="year-nav">{yearNavItems}</div>;

    const listItems = data.map((item, i) => {
      if (item.values){
        let itemsPerDay = item.values;
        if (i===highlighted) {
          rowClass+=" highlight";
        }
        // previous
        const dailyItems = itemsPerDay.map((d, j) => {
          // new date check
          currentDate = Date.parse(new Date(item.key));
          const sameDate = previousDate === currentDate ? true : false;

          // this same as previous date?
          if (sameDate) {
            itemDate = "";
            rowClass = "";
            newDate = false;
          } else {
            previousDate = currentDate;
            itemDate = item.date;
            rowClass = newDateClass;
            newDate = true;
          }

          const movieYear = (d.type === 'movie' && d.year) ? <span className="year">{d.year}</span> : null;
          const bookCredit = d.credit ? <span className="credit">{d.credit}</span> : null;
          const notes = d.notes
            ? <span className="notes">
                <span className="notes-date">{Moment(item.key).format("MMMM, D")}</span>
                <br />
                {d.notes}
              </span>
            : null;

          let element = <div
                          id={i+"_"+j}
                          data-date={currentDate}
                          className={'item ' + d.type + " " + rowClass}
                          onClick={() => setHighlight(d.title, "title")}
                        >
                          <span className="title">{d.title}</span>
                          {movieYear}
                          {bookCredit}
                          {notes}
                        </div>;
          return element;

        });
        return dailyItems;
      }
    }, this)
    return (
      <div className="media-list">
        {yearNav}
        {listItems}
      </div>
    );
  }
}
