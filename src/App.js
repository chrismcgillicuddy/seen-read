import React, { Component } from 'react';
import * as _ from 'lodash';
import * as toTitleCase from 'to-title-case';
import { InView } from 'react-intersection-observer';
import * as classNames from 'classnames';

import './App.scss';
import Loader from './loader';
import YearPlot from './yearPlot';
import MediaList from './mediaList';
import MostSeenRead from './mostSeenRead';
import ProgressCircle from './progressCircle';
import soderbergh from './assets/soderbergh.png';

const progressRadius = 30;
const yearsAvailable = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];
const desktopSize = 800;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlighted: null,
      highlightedItem: "",
      highlightedType: "title", // is the highlightedItem a titles or credit
      highlightMedia: "", // what is the highlightedItem? A book, film...
      highlightMediaType: "", // highlight all books, movies...
      loading: true,
      mediaLists: {},
      browseYearLists: true,
      displayYear: '2018',
      radialProgress: 0,
      mediaListItemsOnScreen: [],
      scrollState: 0,
      isDesktop: true,
      stickHeader: false
    }
    this.grid = React.createRef();
  }

  componentDidMount() {
    Promise.all([
      fetch('./data/2009-2018.json',
        {headers:
          {'Accept': 'application/json',
          'Content-Type': 'application/json'
          }
        }
      )
    ]).then(responses => Promise.all(responses.map(resp => resp.json())))
    .then(([list]) => {
      const list2018 = this.getYear(list, 2018);
      const list2017 = this.getYear(list, 2017);
      const list2016 = this.getYear(list, 2016);
      const list2015 = this.getYear(list, 2015);
      const list2014 = this.getYear(list, 2014);
      const list2013 = this.getYear(list, 2013);
      const list2012 = this.getYear(list, 2012);
      const list2011 = this.getYear(list, 2011);
      const list2010 = this.getYear(list, 2010);
      const list2009 = this.getYear(list, 2009);

      this.setState({ mediaLists: {list2018, list2017, list2016, list2015, list2014, list2013, list2012, list2011, list2010, list2009} });
      this.setState({ loading: false });
      this.isUsingDesktop();
    });

    // ESC key clears title highlight
    document.addEventListener("keydown", this.escKey, false);

    // check window size
    window.addEventListener("resize", _.debounce(this.isUsingDesktop, 100));

    // check scroll position to stick nav to top of window
    window.addEventListener('scroll', this.stickHeaderNav);
  }

  onViewChange = (inView, highlight) => {
    // console.log(inView, highlight);
    // if (inView){
    //   this.setMediaHighlightType(""); // reset here for now, in case a year needs focus
    //   var newState = {};
    //   newState[highlight.highlight] = highlight.value;
    //   this.setState(newState);
    // }
  }

  makeChartSticky = () => {
    console.log("makechartSticky");
  }

  stickHeaderNav = () => {
    // const container = document.getElementById("app-container");
    const yearNavBlock = document.getElementById("year-nav-block");
    const navPosition = yearNavBlock.offsetTop;
    if (window.pageYOffset >= navPosition) {
      this.setState({stickHeader: true});
      console.log("stickHeader: true");
    } else {
      this.setState({stickHeader: false});
      console.log("stickHeader: false");

    }
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.escKey, false);
    window.removeEventListener("resize", this.isUsingDesktop);
  }

  mediaListVisibility = () => {
    // this.isUsingDesktop(); // check screen size;
    // console.log("mediaListVisibility, isDesktop?", this.state.isDesktop);
    if (this.state.isDesktop) {// only update the items visible if we're displaying the year plots on a desktop screen
      // check visible elements in MediaList
      const mediaListContainer = document.getElementById("list-panel");
      // console.log("mediaListContainer",mediaListContainer);
      const mediaListElement = document.getElementsByClassName("media-list");
      let clientHeight = document.documentElement.clientHeight;
      // console.log("clientHeight",clientHeight);

      if (_.isElement(mediaListElement[0])){
        const listItems = mediaListElement[0].childNodes;
        let start = 0;
        let end = listItems.length;

        while(start !== end) {
          let mid = start + Math.floor((end - start) / 2);
          let item = listItems[mid];
          if(item.offsetTop < (mediaListContainer.scrollTop - 77)) {
            start = mid + 1;
          } else {
            end = mid;
          }
        }

        let isOnScreen = true;
        let onScreenItems = [];
        let onScreenItemListPosition = start;
        const headerElementHeight = 77; // TODO, set this elsewhere?

        while(isOnScreen && (onScreenItemListPosition <= listItems.length)) {
          let item = listItems[onScreenItemListPosition];
          if (item){
            // console.log("document scrollTop",document.documentElement.scrollTop);
            // console.log("document scrollHeight",document.documentElement.scrollHeight);
            // console.log("document offsetHeight",document.documentElement.offsetHeight);
            const itemPosition = (item.getBoundingClientRect().top - mediaListContainer.scrollTop - headerElementHeight);
            // const test = (itemPosition > 0) ? console.log("item > 0") : console.log("OFF SCREEN");
            // const test2 = (itemPosition < clientHeight) ? console.log("LESS than height") : console.log("more than height");
            // const test2 = (itemPosition < clientHeight && itemPosition > 0) ? console.log("BOTH") : console.log("NEITHER");

            if ( itemPosition < clientHeight ){
              if ( itemPosition > 0 ) {
                onScreenItems.push(item.dataset.date);
              }
            }
            else {
              isOnScreen = false;
            }
          }
          onScreenItemListPosition++;
        }
        // console.log(onScreenItems);
        this.updateOnScreenItems(onScreenItems);
      }
    } else { // isDesktop
      // console.log("SMALL SCREEN");
    }
  }

  escKey = (event) => {
    if(event.keyCode === 27) {
      this.setHighlight("", "title", "");
    }
  }

  getYear = (results, yearFilter) => {
    const singleYear = results.filter(function (d) {
      const itemDate = new Date(d.key);
      const itemYear = itemDate.getFullYear();
      return itemYear === yearFilter;
    });
    return singleYear;
  }

  updateOnScreenItems = (mediaListItemsOnScreen) => {
    this.setState({mediaListItemsOnScreen});
  }

  setMediaListHighlight = (highlighted) => {
    this.setState({highlighted});
  }

  setHighlight = (highlightedItem, highlightedType, highlightedMedia) => {
    const titleElement = document.getElementById("selected-title");
    titleElement.textContent = toTitleCase(highlightedItem);
    const typeElement = document.getElementById("selected-title-type");
    typeElement.textContent = toTitleCase(highlightedMedia);

    if (highlightedItem.length > 0) highlightedItem = highlightedItem.toString().toLowerCase();
    this.setState({highlightedItem});
    this.setState({highlightedType});
    this.setState({highlightedMedia});
  }

  setProgressCirclePosition = (year) => {
    // position progressRadius
    const index = yearsAvailable.indexOf(year);
    const leftPosition = ((index * 65) - 12);
    const element = document.getElementsByClassName("progress-circle-container");
    element[0].style.left = leftPosition+"px";
  }

  setDisplayYear = (displayYear) => {
    this.setProgressCirclePosition(displayYear);
    this.setState({highlightMediaType: ''}); // reset mediaType highlight
    this.setState({displayYear});
  }

  setMediaHighlightType = (highlightMediaType) => {
    this.setState({'displayYear': ''});// reset selected year
    this.setState({highlightMediaType}); // reset mediaType highlight
  }

  setRadialProgress = (radialProgress) => {
    this.setState({radialProgress});
  }

  isUsingDesktop = () => {
    // console.log("window.innerWidth",window.innerWidth);
    this.setState({ isDesktop: window.innerWidth > desktopSize });
  }

  // toggle YearPlot size
  toggleExpanded() {
    const currentState = this.state.browseYearLists;
    this.setState({ browseYearLists: !currentState });
  }

  render() {
    const { mediaLists,
            error,
            scrollState,
            highlighted,
            highlightedItem,
            highlightedType,
            highlightMediaType,
            browseYearLists,
            displayYear,
            radialProgress,
            mediaListItemsOnScreen,
            isDesktop } = this.state;

    if (error) {
      return(
        <div>
          <p>There's a problem reading the Seen & Read media list.</p>
        </div>
      );
    }
    if (!this.state.loading){

      const yearNavItems = yearsAvailable.map((year) => {
        let yearEntry = "";
        let selectedClass ="";
        (year == displayYear)
          ? selectedClass = " selected"
          : selectedClass = "";
        yearEntry = <span className={"link"+selectedClass} onClick={() => this.setDisplayYear(year)}>{year}</span>
        return yearEntry;
      }, this);

      const yearNav = <div className="year-links">{yearNavItems}</div>;

      const exploreClasses= classNames({
        'explore': true,
        'browse-single-year': browseYearLists,
        'title-highlight': highlightedItem,
      });

      const highlightMediaTypeOn = highlightMediaType.length > 0;

      const yearPlotClasses = classNames({
        'year-plots': true,
        'browse-year-lists': browseYearLists,
        'mediaTypeHighlighting': highlightMediaTypeOn,
        'highlight-tv': highlightMediaType==='tv',
        'highlight-movies': highlightMediaType==='movie',
        'highlight-books': highlightMediaType==='book',
        'highlight-plays': highlightMediaType==='play',
        'highlight-special': highlightMediaType==='special'
      });

      const appStateClasses = classNames({
        app: true,
        'expand-year-plots': !browseYearLists,
        'stick-header': this.state.stickHeader
      })

      const chartTitleHighlightClasses = classNames({
        'title-hightlight chart-selection': true,
        'has-title': highlightedItem
      })

      return (
        <div className={appStateClasses} id="app-container">

          {/*
          <div className="header-row">

            <div className="main-heading heading-name-plate">Seen, Read</div>

            <p className="intro">Filmmaker <a href="https://en.wikipedia.org/wiki/Steven_Soderbergh">Stephen Soderbergh</a> has been sharing
            a <a href="http://extension765.com/soderblogh/33-seen-read-2018">daily account</a> of
            every <span className="movie-label">movie</span>, <span className="book-label">book</span>, <span className="play-label">play</span>, and <span className="tv-label">TV</span> show he's
            seen or read for the past 10 years.</p>


          </div>

          */}

            {/* <p class="intro">The lists highlight the directpr's interests in span the history of cinema</p>
            Offers a glimps (more than a glimps)
            In that time, he's created film and television projects
            */}


            <div className="intro-with-illustration">
              <div className="name-plate">Seen,Read</div>
              <p className="intro">Filmmaker <a href="https://en.wikipedia.org/wiki/Steven_Soderbergh">Stephen Soderbergh</a> has been sharing
              a <a href="http://extension765.com/soderblogh/33-seen-read-2018">daily account</a> of
              every <span className="movie-label">movie</span>, <span className="book-label">book</span>, <span className="play-label">play</span>,
              and <span className="tv-label">TV</span> show he's
              seen or read for the past 10 years.</p>
              <p className="intro">Taken as a whole or explored per year, this is a fascinating backdrop of
              influences to study or mine related to his own projects over the last decade.</p>
            </div>


{/*
          <div class='seen-read-intro'>
            <div class='row'>
              <div class='column'>
                <div class='illustration-column'>
                <img className="steven" src={soderbergh} width="250" alt="Steven Soderbergh" />
                </div>
              </div>
              <div class='column'>
                <div class='intro-column'>
                                  </div>
              </div>
            </div>
          </div>
*/}

          <div className="nav-wrap" id="year-nav-block">
            <div className="logo-block name-plate"><a href="#" title="Home">Seen,Read</a></div>
            <div className="year-nav">
              {yearNav}
              <ProgressCircle
                className={'progress-circle'}
                radius={progressRadius}
                radialProgress={radialProgress}
                displayYear={displayYear}
              />
            </div>
            <button onClick={() => this.toggleExpanded()} className="option-button">
            {browseYearLists
              ? 'View most seen, read'
              : 'Browse by year'
            }
            </button>
          </div>


          {/* hover title */}
          <div className="title-hightlight selected-title-hover">
            <div className="left-col">
              <span className="type"></span>
            </div>
            <div className="right-col">
              <span className="title"></span>
            </div>
          </div>

        <div className="year-chart">

          <div className="year-plot-container" tag="div">

            <div className={yearPlotClasses}>
              {
                yearsAvailable.map((year) => {
                  const isSelectedYear = (year == displayYear) ? true : false;
                  return <YearPlot
                    scrollState={scrollState}
                    data={mediaLists['list'+year]}
                    isSelectedYear={isSelectedYear}
                    highlighted={highlighted}
                    highlightedItem={highlightedItem}
                    highlightedType={highlightedType}
                    highlightMediaType={highlightMediaType}
                    setHighlight={this.setHighlight}
                    setDisplayYear={this.setDisplayYear}
                    mediaListItemsOnScreen={mediaListItemsOnScreen}
                    mediaListVisibility={this.mediaListVisibility}
                  />
                })
              }
            </div>

            <div className="chart-selection-container">
              <div className={chartTitleHighlightClasses}>
                <div className="left-col">
                  <span id="selected-title-type" className="type"></span>
                </div>
                <div className="right-col">
                  <span id="selected-title" className="title"></span>
                </div>
                <span title="Clear" className="clear-highlight" onClick={() => this.setHighlight("", "title", "")}>✕</span>
              </div>
            </div>

          </div>

        </div>

{/*     <div className="controls" id="list-panel"> */}
        <div className="media-list-test" id="list-panel">
          <MediaList
            data={mediaLists['list'+displayYear]}
            yearsAvailable={yearsAvailable}
            displayYear={displayYear}
            setDisplayYear={this.setDisplayYear}
            highlighted={highlighted}
            highlightedItem={highlightedItem}
            setHighlight={this.setHighlight}
            mediaListVisibility={this.mediaListVisibility}
            updateOnScreenItems={this.updateOnScreenItems}
            setRadialProgress={this.setRadialProgress}
            setMediaListHighlight={this.setMediaListHighlight}
          />
        </div>



        {/* explore / browse list toggle */}
        {/* <div className="year-links">
          <a href="#" className="link" onClick={() => setDisplayYear(year)}>2009</a>
          <a href="#" className="link" onClick={() => setDisplayYear(year)}>2010</a>
          <a href="#" className="link" onClick={() => setDisplayYear(year)}>2011</a>
          <a href="#" className="link">2012</a>
          <a href="#" className="link">2013</a>
          <a href="#" className="link">2014</a>
          <a href="#" className="link">2015</a>
          <a href="#" className="link">2016</a>
          <a href="#" className="link selected">2017</a>

        </div> */}

      </div>
      );
    }
    return (
      <Loader />
    )
  }
}
