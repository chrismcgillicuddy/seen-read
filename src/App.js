import React, { Component } from 'react';
import './App.scss';
import YearPlot from './yearPlot';
import MediaList from './mediaList';
import * as _ from 'lodash';
import Loader from './loader';
import ButtonList from './buttonList';
import ProgressCircle from './progressCircle';
import * as toTitleCase from 'to-title-case';
import { InView } from 'react-intersection-observer';
import * as classNames from 'classnames';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

// var classNames = require('classnames');

const progressRadius = 30;
const yearsAvailable = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];
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
      compactYears: true,
      displayYear: '2017',
      radialProgress: 0,
      mediaListItemsOnScreen: [],
      scrollState: 0,
      isDesktop: true
    }
  }

  componentDidMount() {
    Promise.all([
      fetch('./data/2009-2017.json',
        {headers:
          {'Accept': 'application/json',
          'Content-Type': 'application/json'
          }
        }
      )
    ]).then(responses => Promise.all(responses.map(resp => resp.json())))
    .then(([list]) => {
      const list2017 = this.getYear(list, 2017);
      const list2016 = this.getYear(list, 2016);
      const list2015 = this.getYear(list, 2015);
      const list2014 = this.getYear(list, 2014);
      const list2013 = this.getYear(list, 2013);
      const list2012 = this.getYear(list, 2012);
      const list2011 = this.getYear(list, 2011);
      const list2010 = this.getYear(list, 2010);
      const list2009 = this.getYear(list, 2009);

      this.setState({ mediaLists: {list2017, list2016, list2015, list2014, list2013, list2012, list2011, list2010, list2009} });
      this.setState({ loading: false });
      this.isUsingDesktop();
    });

    // ESC key clears title highlight
    document.addEventListener("keydown", this.escKey, false);

    // check window size
    window.addEventListener("resize", _.debounce(this.isUsingDesktop, 50));
  }

  onViewChange = (inView, highlight) => {
    console.log(inView, highlight);
    if (inView){
      this.setMediaHighlightType(""); // reset here for now, in case a year needs focus
      var newState = {};
      newState[highlight.highlight] = highlight.value;
      this.setState(newState);
    }
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.escKey, false);
    window.removeEventListener("resize", this.isUsingDesktop);
  }

  mediaListVisibility = () => {
    // this.isUsingDesktop(); // check screen size;
    // console.log("mediaListVisibility, isDesktop?", this.state.isDesktop);

    if (this.state.isDesktop) {
      // check visible elements in MediaList
      const mediaListContainer = document.getElementById("list-panel");
      const mediaListElement = document.getElementsByClassName("media-list");
      console.log("mediaListContainer scrollHeight",mediaListContainer.scrollHeight);
      console.log("mediaListElement scrollHeight",mediaListElement[0].scrollHeight);
      let clientHeight = document.documentElement.clientHeight;

      if (_.isElement(mediaListElement[0])){
        const dailyItems = mediaListElement[0].childNodes;
        let start = 0;
        let end = dailyItems.length;

        while(start !== end) {
          let mid = start + Math.floor((end - start) / 2);
          let item = dailyItems[mid];
          if(item.offsetTop < mediaListContainer.scrollTop)
            start = mid + 1;
          else
            end = mid;
        }
        // console.log('dailyItems start',start);

        let isOnScreen = true;
        let onScreenItems = [];
        let onScreenItemCount = start;

        while(isOnScreen) {

          let item = dailyItems[onScreenItemCount];
          if (item){
            console.log("item",item);
            console.log("item.offsetTop",item.offsetTop);

            if ((item.offsetTop - mediaListContainer.scrollTop) < (clientHeight))
              onScreenItems.push(item.dataset.date);
            else
              isOnScreen = false;
          }
          onScreenItemCount++;
        }
        // console.log("------");
        // console.log("onScreenItems", onScreenItems);
        // console.log("clientHeight", clientHeight);

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

  setDisplayYear = (displayYear) => {
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
    console.log("window.innerWidth",window.innerWidth);
    this.setState({ isDesktop: window.innerWidth > desktopSize });
  }

  // toggle YearPlot size
  toggleExpanded() {
    const currentState = this.state.compactYears;
    this.setState({ compactYears: !currentState });
  }

  render() {
    const { mediaLists,
          error,
          scrollState,
          highlighted,
          highlightedItem,
          highlightedType,
          highlightMediaType,
          compactYears,
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
        yearEntry = <a href="#" className={"link"+selectedClass} onClick={() => this.setDisplayYear(year)}>{year}</a>
        return yearEntry;
      }, this);

      const yearNav = <div className="year-links">{yearNavItems}</div>;

      const exploreClasses= classNames({
        'explore': true,
        'media-list-view': compactYears,
        'title-highlight': highlightedItem,
        'expand-year-plots': !compactYears
      });

      const highlightMediaTypeOn = highlightMediaType.length > 0;

      const yearPlotClasses = classNames({
        'year-plots': true,
        'compact-years': compactYears,
        'mediaTypeHighlighting': highlightMediaTypeOn,
        'highlight-tv': highlightMediaType==='tv',
        'highlight-movies': highlightMediaType==='movie',
        'highlight-books': highlightMediaType==='book',
        'highlight-plays': highlightMediaType==='play',
        'highlight-special': highlightMediaType==='special'
      });

      return (
        <div>
          {/* <section className="cover">
            <span>Seen,Read</span>
          </section> */}
          {yearNav}
          <section className={exploreClasses} id="test-container">
          {/* <header>
            <span className="title">Seen,Read</span>
            <div className="options">
              <button onClick={() => this.toggleExpanded()} className="option-button">{compactYears ? 'More': 'Less'}</button>
            </div>
          </header> */}
          <div className="chart">
              <div className="intro">
                <h1><span className="seen">Seen</span><span className="comma">,</span> Read</h1>
                <p>Filmmaker <a href="https://en.wikipedia.org/wiki/Steven_Soderbergh" className="link">Steven Soderbergh</a> has maintained
                a daily account of every book, film, play, and TV show he's seen or read for the past 9 years.</p>
                <p></p>
              </div>
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
                <div className="title-hightlight chart-selection">
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

          <div className="controls" id="list-panel">
            {/* <ProgressCircle
              className={'progress-circle'}
              radius={progressRadius}
              radialProgress={radialProgress}
              displayYear={displayYear}
            /> */}

            <CSSTransition
             in={true}
             classNames="xyz"
             appear={true}
             timeout={5000}>
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
            </CSSTransition>
            {/*
            <ScrollPercentage>
              {(percentage, inView) => (
                <h2>{`Percentage scrolled: ${calcPercentage(percentage)}%.`}</h2>
              )}
            </ScrollPercentage> */}


            {/* <InView tag="div" onChange={inView => this.onViewChange(inView, {highlight: "highlightMediaType", value: "movie"} )}>
              <div className="step">Movies</div>
            </InView>

            <InView tag="div" onChange={inView => this.onViewChange(inView, {highlight: "highlightMediaType", value: "tv"} )}>
              <div className="step">TV</div>
            </InView>

            <InView tag="div" onChange={inView => this.onViewChange(inView, {highlight: "highlightMediaType", value: "book"} )}>
              <div className="step">Books</div>
            </InView>

            <InView tag="div" onChange={inView => this.onViewChange(inView, {highlight: "highlightMediaType", value: "play"} )}>
              <div className="step">Plays</div>
            </InView>

            <InView tag="div" onChange={inView => this.onViewChange(inView, {highlight: "highlightMediaType", value: "special"} )}>
              <div className="step">Special!</div>
            </InView>

            <InView tag="div" onChange={inView => this.onViewChange(inView, {highlight: "highlightMediaType", value: ""} )}>
              <div className="step">
                <ButtonList
                  compactMode={compactYears}
                  highlightedItem={highlightedItem}
                  setHighlight={this.setHighlight}
                />
              </div>
            </InView> */}

          </div>

        {/* </section> */}
        {/* <section className="media-list-panel" id="list-panel"> */}

        </section>

        {/* hover title */}
        <div className="title-hightlight selected-title-hover">
          <div className="left-col">
            <span className="type"></span>
          </div>
          <div className="right-col">
            <span className="title"></span>
          </div>
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

        <button onClick={() => this.toggleExpanded()} className="option-button">{compactYears ? 'View all years': 'Browse one year'}</button>

      </div>
      );
    }
    return (
      <Loader />
    )
  }
}
