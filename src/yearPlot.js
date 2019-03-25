import React from 'react';
import * as _ from "lodash";
import * as d3 from 'd3';
import * as toTitleCase from 'to-title-case';

export default class YearPlot extends React.Component {

  showTitle = (title, type) => (e) => {
    title = toTitleCase (title);
    d3.select(".selected-title-hover .title").text(title);
    d3.select(".selected-title-hover .type").text(type);
    d3.select(".selected-title-hover")
      .style('top', (e.clientY-20)+"px")
      .style('left', (e.clientX+20)+"px")
      .style('opacity', 1);
  }

  hideTitle = () => {
    d3.select(".selected-title-hover")
      .style('opacity',0);
  }

  changeYear = (year) => {
    this.props.setDisplayYear(year);
    this.props.mediaListVisibility();
  }

  highlightItem = (title) => {
    this.props.setHighlight(title);
  }

  render() {
    const {data,
          isSelectedYear,
          setHighlight,
          highlightedItem,
          highlightedType,
          highlightedMedia,
          mediaListItemsOnScreen } = this.props;
    let currentDate = '';
    let itemDate = '';
    let onScreenClass = '';
    let mediaIndex = 0;

    const date = new Date(data[0].key);
    const year = date.getFullYear();
    const selectedYearClass = (isSelectedYear) ? "selected-year" : "";
    const listItems = data.map((item, i) => {
      // get date object from date string
      currentDate = new Date(item.key);
      let dateCompare = Date.parse(new Date(item.key));
      let rowClass = "";
      // is an even or odd numbered month?
      if (currentDate.getMonth() % 2 === 0) {
        rowClass = "odd-month";
      }

      // check if date is currently on screen in mediaLists
      if (item.values && item.values.length > 0) {
        if (isSelectedYear && _.includes(mediaListItemsOnScreen, dateCompare.toString())){
          onScreenClass = " on-screen";
        }else {
          onScreenClass = " ";
        }
      }

      rowClass += onScreenClass;
      let itemsPerDay = item.values;

      if (item.values && item.values.length > 0){

        // this same as previous date?
        itemDate = item.date;
        // console.log("highlightMedia",highlightMedia);

        return (
          <ul key={itemDate} className={rowClass+' daily-items'}>
            {itemsPerDay.map(d => {
              // highlight class
              let itemClass = "";
              let title = d.title.toString().toLowerCase();
              let type = d.type.toString().toLowerCase();
              let credit = d.credit.toString().toLowerCase();

              if (highlightedType==="title"){
                if ( (title===highlightedItem) && (type == highlightedMedia) ) {
                  itemClass+="highlight ";
                }
              }
              if (highlightedType==="credit"){
                if (credit===highlightedItem) {
                  itemClass+="highlight ";
                }
              }
              if (d.title.length <= 10)  {
                itemClass+="short-title ";
              }
              if (d.title.length > 10  && d.title.length <= 20) {
                itemClass+="medium-title ";
              }
              if (d.title.length > 20) {
                itemClass+="long-title ";
              }

              // track id
              let key, id = year+"_"+mediaIndex;
              let element = <li key={key}
                                id={id}
                                className={itemClass+" item-"+type}
                                onMouseOver={this.showTitle(d.title, type)}
                                onMouseOut={this.hideTitle}
                                onClick={() => setHighlight(d.title, "title", type)}></li>;
              mediaIndex++;
              return element;
            })}
          </ul>
        )
      } else { // no values
        return (
          <ul className={rowClass+onScreenClass+" daily-items"}><li className="empty-date"></li></ul>
        )
      }
    }, this);

    return (
      <div className={"year-plot "+selectedYearClass}>
        <span
          className="plot-year-label"
          title={"Show "+date.getFullYear()}
          onClick={() => this.changeYear(year)}
        >
          {year}
        </span>
        {listItems}
      </div>
    );
  }
}
