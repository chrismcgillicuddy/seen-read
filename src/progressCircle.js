import React from 'react';
import PropTypes from 'prop-types';

function ProgressCircle({ className, radius, radialProgress, displayYear }) {
  const circumference = 2 * Math.PI * radius;
  const strokeDashArray = radialProgress+', '+circumference;

  return (
    <div className="progress-circle-container">
      <svg className="progress-circle" viewBox="0 0 60 60">
        <defs>
          <mask id="hole">
            <circle id="disk" fill="white" r="30" cx="30" cy="30"></circle>
            <circle id="disk-center" r="18" cx="30" cy="30"></circle>
         </mask>
       </defs>
       <circle className='progress-disk' stroke-dasharray={strokeDashArray} id="disk-progress" mask="url(#hole)" cx="30" cy="30" r="30" stroke-width="30" fill="#333"></circle>
       <text x="18" y="-26" class="progress-year">{displayYear}</text>
      </svg>
    </div>
  );
}

ProgressCircle.propTypes = {
  className: PropTypes.string,
  radialProgress: PropTypes.number
};

ProgressCircle.defaultProps = {
  className: undefined,
  radialProgress: 0
};

export default ProgressCircle;
