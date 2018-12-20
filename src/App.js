import React, { Component } from 'react';
import './App.scss';
import {nest} from 'd3-collection';
import YearPlot from './yearPlot';
import MediaList from './mediaList';
import * as _ from 'lodash';
import Loader from './loader';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import ButtonList from './buttonList';
import ProgressCircle from './progressCircle';
import * as toTitleCase from 'to-title-case';

const moment = extendMoment(Moment); // add moment-range
const progressRadius = 30;
const yearsAvailable = [2009,2010,2011,2012,2013,2014,2015,2016,2017];

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlighted: null,
      highlightedItem: "",
      highlightedType: "title",
      loading: true,
      mediaLists: {},
      compactYears: true,
      displayYear: '2017',
      radialProgress: 0,
      mediaListItemsOnScreen: []
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

      this.setState({mediaLists: {list2017, list2016, list2015, list2014, list2013, list2012, list2011, list2010, list2009}});
      this.setState({loading: false});
    });

    // ESC key clears title highlight
    document.addEventListener("keydown", this.escKey, false);

  }

  componentWillUnmount(){
    const mediaListElement = document.getElementsByClassName("media-list");
    document.removeEventListener("keydown", this.escKey, false);
    mediaListElement[0].removeEventListener('scroll', this.handleScroll);
  }

  mediaListVisibility = () => {
    // check visible elements in MediaList
    const mediaListContainer = document.getElementById("list-panel");
    const mediaListElement = document.getElementsByClassName("media-list");
    let clientHeight = document.documentElement.clientHeight;

    if (_.isElement(mediaListElement[0])){
      const dailyItems = mediaListElement[0].childNodes;
      let start = 0;
      let end = dailyItems.length;
      let count = 0;

      while(start !== end) {
        count++;
        let mid = start + Math.floor((end - start) / 2);
        let item = dailyItems[mid];
        if(item.offsetTop < mediaListContainer.scrollTop)
          start = mid + 1;
        else
          end = mid;
      }

      let isOnScreen = true;
      let onScreenItems = [];
      let onScreenItemCount = start;

      while(isOnScreen) {
        let item = dailyItems[onScreenItemCount];
        if ((item.offsetTop - mediaListContainer.scrollTop) < (clientHeight))
          onScreenItems.push(item.dataset.date);
        else
          isOnScreen = false;
        onScreenItemCount++;
      }
      this.updateOnScreenItems(onScreenItems);
    }
  }

  escKey = (event) => {
    if(event.keyCode === 27) {
      this.setHighlight("", "title");
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

  setHighlight = (highlightedItem, highlightedType) => {
    const el = document.getElementById("selected-title");
    el.textContent = toTitleCase(highlightedItem);
    highlightedItem = highlightedItem.toString().toLowerCase();
    this.setState({highlightedItem});
    this.setState({highlightedType});
  }

  setDisplayYear = (displayYear) => {
    this.setState({displayYear});
  }

  setRadialProgress = (radialProgress) => {
    this.setState({radialProgress});
  }

  // toggle YearPlot size
  toggleExpanded() {
    const currentState = this.state.compactYears;
    this.setState({ compactYears: !currentState });
  }

  render() {
    const {mediaLists,
          error,
          highlighted,
          highlightedItem,
          highlightedType,
          compactYears,
          displayYear,
          radialProgress,
          mediaListItemsOnScreen} = this.state;

    if (error) {
      return(
        <div>
          <p>There's a problem reading the Seen & Read media list.</p>
        </div>
      );
    }
    if (!this.state.loading){
      let rowClasses = "main";
      if (highlightedItem) {
        rowClasses+=' title-highlight';


      }
      if (!compactYears) {
        rowClasses+=' expand-year-plots';
      }

      return (
        <section className={rowClasses}>
          <header>
            <span className="title">Seen,Read</span>
            <div className="options">
              <button onClick={() => this.toggleExpanded()} className="option-button">{compactYears ? 'More': 'Less'}</button>
            </div>
          </header>
          <section className={compactYears ? 'compact-years year-plot-group' : 'year-plot-group'} id="grid">
            <div className="year-container">
            {
              yearsAvailable.map((year) => {
                const isSelectedYear = (year == displayYear) ? true : false;
                return <YearPlot
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
            <div className="highlighted-title-outer">
              <div className="highlighted-title-inner">
                <span id="selected-title"></span>
                <span title="Clear" className="clear-highlight" onClick={() => this.setHighlight("", "title")}>✕</span>
              </div>
            </div>
            <div className="selected-title-hover"></div>

          </div>
          </section>
          <ButtonList
            compactMode={compactYears}
            highlightedItem={highlightedItem}
            setHighlight={this.setHighlight}
          />
          <section className="media-list-panel" id="list-panel">

            <ProgressCircle
              className={'progress-circle'}
              radius={progressRadius}
              radialProgress={radialProgress}
              displayYear={displayYear}
            />
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
            />
          </section>
        </section>
      );
    }
    return (
      <Loader />
    )
  }

}
