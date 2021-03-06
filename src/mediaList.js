import React from 'react';
import Moment from 'moment';
import * as _ from 'lodash';
import * as classNames from 'classnames';
import * as toTitleCase from 'to-title-case';
import { soderberghProjects } from './soderberghProjects';

// const uuidv4 = require('uuid/v4');
const progressRadius = 30;

export default class MediaList extends React.Component {

  componentDidMount() {
    // const mediaListPanel = document.getElementById("app-container");

    // mediaListPanel.addEventListener('scroll', this.props.mediaListVisibility);
    // mediaListPanel.addEventListener('scroll', this.updateRadialProgress);

    window.addEventListener('scroll', _.debounce(this.props.mediaListVisibility, 10));
    window.addEventListener('scroll', _.debounce(this.updateRadialProgress, 10));

    // window.addEventListener('scroll', this.props.mediaListVisibility);
    // window.addEventListener('scroll', this.updateRadialProgress);

    this.props.mediaListVisibility();
    // this.setState({ listHeight: contentHeight });
  }

  componentDidUpdate() {
    const isMostSeenReadMode = this.props.compactMode;

    // refresh the height of the list container after measuring the new list content
    const newContentHeight = this.props.getMediaListContentHeight();

    if(isMostSeenReadMode && this.props.contentHeight !== newContentHeight) {
      this.props.setMediaListContentHeight();
    }
  }

  componentWillUnmount(){
    window.removeEventListener('scroll', this.props.mediaListVisibility);
    window.removeEventListener('scroll', this.updateRadialProgress);
  }

  updateRadialProgress = (event) => {
    // move this radial progress setup
    let circumference = 2 * Math.PI * progressRadius;
    let clientHeight = document.documentElement.clientHeight;
    let scrollHeight = document.documentElement.scrollHeight;
    let contentHeight = scrollHeight - clientHeight;
    let strokeDashArray = (document.documentElement.scrollTop / contentHeight) * circumference;

    // update radial progress state with strokeDashArray
    this.props.setRadialProgress(strokeDashArray);
  }

  render() {
    const {
      data,
      compactMode,
      mostSeenReadItems,
      highlighted,
      highlightedItem,
      setHighlight,
      setMediaListHighlight} = this.props;
    let previousDate = '';
    let currentDate = '';
    let itemDate = '';
    let newDate = true;

    const mediaListClasses = classNames({
      'media-list': true
    });

    const listItems = data.map((item, i) => {
      if (item.values){
        let itemsPerDay = item.values;

        // previous
        const dailyItems = itemsPerDay.map((d, j) => {
          // new date check
          currentDate = Date.parse(new Date(item.key));
          const sameDate = previousDate === currentDate ? true : false;

          // this same as previous date?
          if (sameDate) {
            itemDate = "";
            newDate = false;
          } else {
            previousDate = currentDate;
            itemDate = item.date;
            newDate = true;
          }

          // remove upper case from type
          const type = d.type.toString().toLowerCase();
          const title = d.title.toString().toLowerCase();
          const isSoderberghProject = soderberghProjects.includes(title);
          const movieYear = (( type === 'movie' || type === 'short') && d.year) ? <span className="year">{d.year}</span> : null;
          const bookCredit = d.credit ? <span className="credit">{toTitleCase(d.credit)}</span> : null;

          // item classes
          const itemClasses = classNames({
            'item': true,
            'chart-selection-highlight': highlightedItem==title,
            'highlighted': currentDate==highlighted,
            'movie': type==="movie",
            'tv': type==="tv",
            'short': type==="short",
            'short-story': type==="short story",
            'book': type==="book",
            'play': type==="play",
            'special': type==="special",
            'new-date': sameDate
          });

          const longDate = <span className="date long-date">{Moment(item.key).format("MMM D")}</span> // January 1
          const shortDate = <span className="date short-date">{Moment(item.key).format("M/D")}</span>; // 1/1
          const time = new Date().getTime();
          const key = currentDate+"_"+time;
          const notes = d.notes ? <span className="note">"{d.notes}"</span> : null;
          const mediaType = (d.type==="Special") ? "Soderbergh project event" : d.type;
          const mediaTypeLabel = isSoderberghProject ? <span className="type">{d.type} (Soderbergh project)</span> : <span className="type">{mediaType}</span>;
          const detailsClasses = classNames({
            'details': true,
            'repeatedDate': !(newDate || d.notes)
          });

          // is this one of the most read titles (repeat viewing/reading)
          const isFavorite = typeof(_.find(mostSeenReadItems, {'key': title})); // look for title in most seen,read list
          const favorite = (isFavorite === "object") ? <div className="favorite" title="Favorite title, seen or read more than once">★</div> : null;

          // create notes element if there are any notes or the date differs from the last entry
          const notesNode = <span className={detailsClasses}>
                              {longDate}{shortDate}
                              {notes}
                              {mediaTypeLabel}
                            </span>;

          let element = <div
                          // key={uuidv4()}
                          id={currentDate}
                          data-date={currentDate}
                          className={itemClasses}
                          onClick={() => {
                            setHighlight(d.title, "title", type);
                            setMediaListHighlight(currentDate);
                          }}
                        >
                          <span className="title">{toTitleCase(d.title)}</span>
                          {favorite}
                          {movieYear}
                          {bookCredit}
                          {notesNode}
                        </div>;
          return element;

        });
        return dailyItems;
      }
    }, this);

    return (
      <div>
        <div className={mediaListClasses} id="test-element">
          {listItems}
        </div>
      </div>
    );
  }
}
