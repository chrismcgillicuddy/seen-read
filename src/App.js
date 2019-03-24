import React, { Component } from 'react';
import * as _ from 'lodash';
import * as toTitleCase from 'to-title-case';
import * as classNames from 'classnames';
import ReactGA from 'react-ga';
import * as d3 from 'd3';

import './App.scss';
import Loader from './loader';
import YearPlot from './yearPlot';
import MediaList from './mediaList';
import MediaLegend from './mediaLegend';
import MostSeenRead from './mostSeenRead';
import ProgressCircle from './progressCircle';

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
      highlightMediaType: "", // highlight all items matching type: books, movies...
      loading: true,
      mediaLists: {},
      titleCounts: {},
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
      ),
      fetch('./data/titles-with-count.json',
        {headers:
          {'Accept': 'text/json',
          'Content-Type': 'application/json'
          }
        }
      )
    ]).then(responses => Promise.all(responses.map(resp => resp.json())))
    .then(([list, titleCounts]) => {
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
      this.setState({ titleCounts: titleCounts });
      // console.log("titleCounts",titleCounts);
      this.isUsingDesktop();
    }).catch(function(e) {
      console.log('err',e);
    });
    //
    // d3.csv('./data/2009-2018-titles-w-counts.csv').then(function(data){
    //
    //         //-------------------------------------------
    //         // get title totals by type
    //         // console.log("MAIN LIST", list);
    //
    //         // var expensesAvgAmount = d3.nest()
    //         //   .key(function(d) { return d.name; })
    //         //   .rollup(function(v) { return d3.mean(v, function(d) { return d.amount; }); })
    //         //   .entries(expenses);
    //         // console.log(JSON.stringify(expensesAvgAmount));
    //
    //         // var expenseMetrics = d3.nest()
    //         //   .key(function(d) { return d.name; })
    //         //   .rollup(function(v) { return {
    //         //     count: v.length,
    //         //     total: d3.sum(v, function(d) { return d.amount; }),
    //         //     avg: d3.mean(v, function(d) { return d.amount; })
    //         //   }; })
    //         //   .entries(expenses);
    //         // console.log(JSON.stringify(expenseMetrics));
    //
    //         // var mediaByTitle = d3.nest()
    //         //   .key(function(d) { return d.values.title; })
    //         //   .entries(list);
    //         //
    //         // console.log("mediaByTitle",mediaByTitle);
    //
    //
    //         // https://stackoverflow.com/questions/42448647/sum-of-nested-json-array-using-d3-rollup
    //         // var data = [
    //         //     {department:'Electro',quant:{M:30, T:20, W:51, R:22, F:35 }},
    //         //     {department:'Beauty',quant:{M:50, T:32, W:75, R:61, F: 45}},
    //         //     {department:'Apparel',quant:{M:62, T:42, W:135, R: 82, F:89}},
    //         //     {department:'Misc',quant:{M:89, T:54, W:103, T:94, F:90}}
    //         // ];
    //         //
    //         // var deptSum = d3.nest()
    //         // .key(function(d) { return d.department; })
    //         // .rollup(function(v) { return {
    //         //     count: v.length,
    //         //     total: d3.sum(d3.values(v[0].quant)),
    //         //     avg: d3.mean(d3.values(v[0].quant))
    //         // }; })
    //         // .entries(data)
    //         //
    //         // console.log(deptSum)
    //
    //         var result = d3.nest()
    //                        .key(function(d) { return d.title.toLowerCase(); })
    //                        .rollup(function(v) { return {
    //                          total: d3.sum(v, function(d) { return d.count; }),
    //                          type: v[0].type
    //                          }; })
    //                        .entries(data);
    //
    //         console.log(result)
    // })

    // ESC key clears title highlight
    document.addEventListener("keydown", this.escKey, false);

    // check window size
    window.addEventListener("resize", _.debounce(this.isUsingDesktop, 10));

    // check scroll position to stick nav to top of window
    window.addEventListener("scroll", _.debounce(this.stickHeaderNav, 10));
    // window.addEventListener("scroll", this.stickHeaderNav);
  }

  initializeReactGA = () => {
    ReactGA.initialize("UA-169426-3");
    ReactGA.pageview(window.location.pathname + window.location.search);
  }

  stickHeaderNav = () => {
    const navElement = document.getElementById("year-nav-block");
    const navPosition = navElement.offsetTop;
    this.setState({
      stickHeader: window.pageYOffset >= navPosition ? true : false
    })
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.escKey, false);
    window.removeEventListener("resize", this.isUsingDesktop);
  }

  mediaListVisibility = () => {
    // this.isUsingDesktop(); // check screen size;
    if (this.state.isDesktop) {// only update the items visible if we're displaying the year plots on a desktop screen
      // check visible elements in MediaList
      const mediaListContainer = document.getElementById("list-panel");
      const mediaListElement = document.getElementsByClassName("media-list");
      let clientHeight = document.documentElement.clientHeight;

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
            const itemPosition = (item.getBoundingClientRect().top - mediaListContainer.scrollTop - headerElementHeight);
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
    // position progressRadius display around the selected year
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
    console.log("setMediaHighlightType MEDIA",highlightMediaType);
    // this.setState({'displayYear': ''});// reset selected year
    this.setState({highlightMediaType}); // reset mediaType highlight
  }

  setRadialProgress = (radialProgress) => {
    this.setState({radialProgress});
  }

  isUsingDesktop = () => {
    this.setState({ isDesktop: window.innerWidth > desktopSize });
  }

  // toggle YearPlot size
  toggleExpanded() {
    const height = document.getElementsByClassName('scrolling-list')[0].clientHeight;

    console.log(".scrolling-list HEIGHT:",height);
    // scrolling-list

    // about to show most seen, read
    if (this.state.browseYearLists){
      this.setHighlight("", "title", ""); // reset title selection
      this.setState({ stickHeader: false });
      window.scrollTo(0,0); // orient the most-seen-read content to the top
      const currentState = this.state.browseYearLists;
    } else {
      // about to browse by year
      this.setState({highlightMediaType: ''}); // reset mediaType highlight
      this.setState({ stickHeader: true });
      window.scrollTo(0,515); // orient the default year scroll position
    }
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
            titleCounts } = this.state;

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

      // const exploreClasses= classNames({
      //   'explore': true,
      //   'browse-single-year': browseYearLists,
      //   'title-highlight': highlightedItem,
      // });

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
        'view-most-seen-read': !browseYearLists,
        'browse-single-year': browseYearLists,
        'stick-header': this.state.stickHeader,
        'title-highlight': highlightedItem
      })

      const chartTitleHighlightClasses = classNames({
        'title-hightlight chart-selection': true,
        'has-title': highlightedItem
      })

      return (
        <div className={appStateClasses} id="app-container">

          <div className="intro-wrap">
            <div className="intro-with-illustration">
              <div className="name-plate">Seen,Read</div>
              <p className="intro">Filmmaker <a href="https://en.wikipedia.org/wiki/Steven_Soderbergh">Stephen Soderbergh</a> has shared
              a <a href="http://extension765.com/soderblogh/33-seen-read-2018">daily account</a> of
              every <span className="movie-label">movie</span>, <span className="book-label">book</span>, <span className="play-label">play</span>,
              and <span className="tv-label">TV</span> show he's
              seen or read for the past 10 years.</p>
              <p className="intro">Scroll down to explore individual years of Stephen's media diet
              or check out his <span className="inline-button" onClick={() => this.toggleExpanded()}>
              most frequently seen and read titles</span> from the last decade to learn his prominent tastes and influences.</p>
            </div>
          </div>

          <div className="nav-wrap" id="year-nav-block">
            <div className="logo-block"><a href="#" title="Home">Seen,Read</a></div>
            <div className="year-nav">
              {yearNav}
              <ProgressCircle
                className={'progress-circle'}
                radius={progressRadius}
                radialProgress={radialProgress}
                displayYear={displayYear}
              />
            </div>
            <button className="button option-button" onClick={() => this.toggleExpanded()} >
            {browseYearLists
              ? '★ Most seen, read'
              : 'Ξ Browse by year'
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

          <div className="seen-read-chart-and-list">

            <div className="multi-year-comparison">
              <div className="multi-year-charts">
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
                        setHighlight={this.setHighlight}
                        setDisplayYear={this.setDisplayYear}
                        mediaListItemsOnScreen={mediaListItemsOnScreen}
                        mediaListVisibility={this.mediaListVisibility}
                      />
                    })
                  }
                </div>
                <div className="chart-selection-container">
                <button className="button expand-reduce-chart" onClick={() => this.toggleExpanded()} >
                {browseYearLists
                  ? <span>Expand <em>→</em></span>
                  : <span><em>←</em> Reduce</span>
                }
                </button>
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

            <div className="scrolling-list" id="list-panel">
              <MediaList
                data={mediaLists['list'+displayYear]}
                highlighted={highlighted}
                highlightedItem={highlightedItem}
                setHighlight={this.setHighlight}
                mediaListVisibility={this.mediaListVisibility}
                setRadialProgress={this.setRadialProgress}
                setMediaListHighlight={this.setMediaListHighlight}
              />
              <MostSeenRead
                titleCounts={titleCounts}
                compactMode={browseYearLists}
                highlightedItem={highlightedItem}
                highlightMediaType={highlightMediaType}
                setMediaHighlightType={this.setMediaHighlightType}
                setHighlight={this.setHighlight}
              />
            </div>

          </div>
          <MediaLegend />
      </div>
      );
    }
    return (
      <Loader />
    )
  }
}
