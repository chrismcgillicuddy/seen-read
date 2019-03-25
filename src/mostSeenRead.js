import React from 'react';
import { nest as d3nest } from 'd3-collection';
import { sum as d3sum } from 'd3-array';
import * as _ from 'lodash';
import * as toTitleCase from 'to-title-case';
import * as classNames from 'classnames';
import { soderberghProjects } from './soderberghProjects';

export default class MostSeenRead extends React.Component {

  componentDidMount() {
    // set container height
    this.props.setMostSeenReadContentHeight();
  }

  // toggle YearPlot size
  toggleMediaHighlight(mediaType) {
    const currentState = this.props.highlightMediaType;
    (mediaType===currentState) ? this.props.setMediaHighlightType("") : this.props.setMediaHighlightType(mediaType);
  }

  render() {
    const {
      mostSeenReadItems,
      compactMode,
      setHighlight,
      highlightMediaType,
      setMediaHighlightType,
      highlightedItem,
      listType,
      contentHeight,
      getMostSeenReadContentHeight,
      setMostSeenReadContentHeight} = this.props;

    // highlight class
    let itemClass = "";

    // most seen, read titles that are also Soderbergh projects
    const soderberghWorkOnly = _.filter(mostSeenReadItems, function(item) {
      return soderberghProjects.includes(item.key);
    });

    // most seen, read titles without Soderbergh projects inlcuded
    const soderberghWorkRemoved = _.filter(mostSeenReadItems, function(item) {
      return !soderberghProjects.includes(item.key);
    });

    const buildMostSeenReadList = (data, media, type) => {
      let list = "";
        list = _.map(data, function(item){
          if(item.value.type == media){
            const title = item.key;
            const itemHighlighted = (title===highlightedItem);
            const itemClasses = classNames({
              'highlight': itemHighlighted
            });

            let element = <li
                            // key={i}
                            className={itemClasses}
                            onClick={() => setHighlight(title, type, media)}>
                            {toTitleCase(title)}
                          </li>;
            return element;
          }
        }, this);
      return list;
    }

    // TODO: order Soderbergh projects correctly by view count,
    const soderberghMovieList = buildMostSeenReadList(soderberghWorkOnly, "movie", "title");
    const soderberghTVList = buildMostSeenReadList(soderberghWorkOnly, "tv", "title");
    const soderberghPlayList = buildMostSeenReadList(soderberghWorkOnly, "play", "title");

    const movieList = buildMostSeenReadList(soderberghWorkRemoved, "movie", "title");
    const tvList = buildMostSeenReadList(soderberghWorkRemoved, "tv", "title");
    const bookList = buildMostSeenReadList(soderberghWorkRemoved, "book", "title");
    const playList = buildMostSeenReadList(soderberghWorkRemoved, "play", "title");
    const authorList = buildMostSeenReadList(soderberghWorkRemoved, "author", "credit");

    const movieFilterClasses = classNames({
      'media-type-filter': true,
      'movies': true,
      'selected': highlightMediaType==="movie"
    });

    const tvFilterClasses = classNames({
      'media-type-filter': true,
      'tv': true,
      'selected': highlightMediaType==="tv"
    });

    const bookFilterClasses = classNames({
      'media-type-filter': true,
      'books': true,
      'selected': highlightMediaType==="book"
    });
    const playFilterClasses = classNames({
      'media-type-filter': true,
      'plays': true,
      'selected': highlightMediaType==="play"
    });

    return (
      <div className={compactMode ? 'hide-buttons most-seen-read' : 'show-buttons most-seen-read'}>
        <div className="top-titles-header">
          <h2><span>★</span><br/>Most seen, read</h2>
          <p>Every title Stephen Soderbergh read or watched more than once over the ten years.
          Titles are ordered from the most seen and read to the least in each group.</p>
        </div>
        <span className='top-title-type'>Stephen Soderbergh projects</span>
        <ul className="">
          {soderberghMovieList}
          {soderberghTVList}
          {soderberghPlayList}
        </ul>

        <span className='top-title-type'>
          <span className={movieFilterClasses} onClick={() => this.toggleMediaHighlight("movie")}>
            Movies <span className="remove-filter">✕</span>
          </span>
        </span>
        <ul className="most-watched-movies">
          {movieList}
        </ul>

        <span className='top-title-type'>
          <span className={tvFilterClasses} onClick={() => this.toggleMediaHighlight("tv")}>
            TV <span className="remove-filter">✕</span>
          </span>
        </span>
        <ul className="most-watched-tv">
          {tvList}
        </ul>

        <span className='top-title-type'>
          <span className={bookFilterClasses} onClick={() => this.toggleMediaHighlight("book")}>
            Books <span className="remove-filter">✕</span>
          </span>
        </span>
        <ul className="most-read-books">
          {bookList}
        </ul>

        <span className='top-title-type'>
          <span className={playFilterClasses} onClick={() => this.toggleMediaHighlight("play")}>
            Plays <span className="remove-filter">✕</span>
          </span>
        </span>
        <ul className="most-read-plays">
          {playList}
        </ul>

        <span className='top-title-type'>Authors</span>
        <ul className="most-read-authors">
          {authorList}
        </ul>
      </div>
    );
  }
}
