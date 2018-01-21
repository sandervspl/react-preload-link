// dependencies
import React from 'react';
import PT from 'prop-types';

class Countdown extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            count: props.count,
        };

        this.intervalId = null;
    }

    componentDidMount() {
        this.intervalId = setInterval(
            () => this.setState((state) => ({ count: state.count - 1 })),
            1000,
        );
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    render() {
        return (
            <h3>{this.state.count}...</h3>
        );
    }
}

Countdown.propTypes = {
    count: PT.number,
};

export default Countdown;
