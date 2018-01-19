import React from 'react';
import PT from 'prop-types';

// eslint-disable-next-line object-curly-newline
const TimeoutForm = ({ waitTime, succeed, setWaitTime, setSucceed }) => (
    <form>
        <div>
            <input type="checkbox" id="succeed" checked={!succeed} onChange={setSucceed} />
            <label htmlFor="succeed">Fail timeout</label>
        </div>

        <div>
            <input
                type="radio"
                name="waitTime"
                value="1000"
                id="waitTime1000"
                onChange={setWaitTime}
                checked={waitTime.id === 'waitTime1000'}
            />
            <label htmlFor="waitTime1000">1 second</label>
        </div>

        <div>
            <input
                type="radio"
                name="waitTime"
                value="2000"
                id="waitTime2000"
                onChange={setWaitTime}
                checked={waitTime.id === 'waitTime2000'}
            />
            <label htmlFor="waitTime2000">2 seconds</label>
        </div>

        <div>
            <input
                type="radio"
                name="waitTime"
                value="5000"
                id="waitTime5000"
                onChange={setWaitTime}
                checked={waitTime.id === 'waitTime5000'}
            />
            <label htmlFor="waitTime5000">5 seconds</label>
        </div>
    </form>
);

TimeoutForm.propTypes = {
    waitTime: PT.shape({
        id: PT.string,
        value: PT.value,
    }),
    succeed: PT.bool,
    setWaitTime: PT.func,
    setSucceed: PT.func,
};

export default TimeoutForm;
