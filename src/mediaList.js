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
    console.log("mediaListPanel",mediaListPanel);
    mediaListPanel.addEventListener('scroll', this.props.mediaListVisibility);
    // mediaListPanel.addEventListener('scroll', () => { console.log("scrolling"); });

    // mediaListPanel.addEventListener('scroll', () =>{// lodash debounce method.
    //   // let supportPageOffset = window.pageXOffset !== undefined;
    //   // let isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');
    //   // let scroll = {
    //   //    x: supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft,
    //   //    y: supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop
    //   // };
    //   //
    //   // if(scroll.y > 100){ // 3000px (arbitrary - put whatever point you need there.)
    //   //   console.log("test scroll.y",scroll.y);
    //   //     // element.setAttribute('class', "insertNewClass");//change the attribute.
    //   // }
    //   console.log("SCROLL LISTENER");
    //   console.log("document.body.scrollTop", document.body.scrollTop);
    //   let clientHeight = document.documentElement.clientHeight;
    //   console.log("clientHeight", clientHeight);
    //
    //   // check to see what's in the view port
    //   const mediaListContainer = document.getElementById("list-panel");
    //   const mediaListElement = document.getElementsByClassName("media-list");
    //   const listItems = mediaListElement[0].childNodes;
    //   console.log("listItems.length", listItems.length);
    //   let start = 0;
    //   let end = listItems.length;
    //   let count = 0;
    //
    //   while(start !== end) {
    //     console.log("mediaListContainer.scrollTop",mediaListContainer.scrollTop);
    //     count++;
    //     let mid = start + Math.floor((end - start) / 2);
    //     let item = listItems[mid];
    //     if(item.offsetTop < mediaListContainer.scrollTop)
    //       start = mid + 1;
    //     else
    //       end = mid;
    //   }
    //   console.log('dailyItems start',start);
    //
    //
    // });

    // const mediaListPanel = document.getElementById("list-panel");
    // const testElement = document.getElementById("test-element");
    // console.log("mediaListPanel",mediaListPanel);
    // window.addEventListener('scroll', this.props.mediaListVisibility);
    // console.log("testElement",mediaListPanel);
    // console.log("testElement offsetHeight",mediaListPanel.offsetHeight);

    mediaListPanel.addEventListener('scroll', this.updateRadialProgress);

    // mediaListPanel.addEventListener('scroll', _.debounce(this.updateRadialProgress, 50));
    // mediaListPanel.addEventListener('scroll', _.debounce(this.props.mediaListVisibility, 50));
    // this.props.mediaListVisibility(); // initial
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
      // var element = document.getElementById(highlighted);
      // console.log("highlighted element:",element);
      // element.scrollIntoView({behavior: "smooth", block: "center"});
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
          // remove upper case from type
          const type = d.type.toString().toLowerCase();
          const movieYear = (type === 'movie' && d.year) ? <span className="year">{d.year}</span> : null;
          const bookCredit = d.credit ? <span className="credit">{d.credit}</span> : null;
          // create notes element if there are any
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
                          className={'item ' + type + " " + rowClass}
                          onClick={() => setHighlight(d.title, "title", type)}
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
      <div className="media-list" id="test-element">
        {listItems}
      </div>
    );
  }
}
