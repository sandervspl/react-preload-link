import React from 'react';
import PT from 'prop-types';
import PreloadLink, { PRELOAD_FAIL } from 'react-preload-link';
import { connect } from 'react-redux';
import { setSuccess, setLoading, setFailed } from '../../ducks/app';
import { getSwapiPerson } from '../../ducks/swapi';

import TimeoutForm from './components/TimeoutForm';
import NotificationBar from './components/NotificationBar';
import FetchForm from './components/FetchForm';
import Countdown from './components/Countdown';

class Home extends React.Component {
    state = {
        waitTime: {
            id: 'waitTime1000',
            value: 1000,
        },
        succeed: true,
        personIdList: ['1'],
        countdown: false,
    }

    setWaitTime = (e) => {
        const { id, value } = e.currentTarget;

        this.setState((state) => ({
            ...state,
            waitTime: { id, value },
        }));
    }

    setSucceed = (e) => {
        const { checked } = e.currentTarget;

        this.setState((state) => ({
            ...state,
            succeed: !checked,
        }));
    }

    setPersonId = (e) => {
        const { personIdList } = this.state;
        const { value } = e.currentTarget;

        const hasPersonId = personIdList.find(id => id === value);

        const newList = hasPersonId !== value
            ? [...personIdList, value]
            : personIdList.filter(id => id !== value);

        this.setState((state) => ({
            ...state,
            personIdList: newList,
        }));
    }

    asyncFn = () => (
        new Promise((resolve) => setTimeout(() => resolve(), this.state.waitTime.value))
    )

    asyncFnFail = () => (
        new Promise((_, reject) => (
            setTimeout(() => reject(PRELOAD_FAIL), this.state.waitTime.value)
        ))
    )

    useFn = () => (
        this.state.succeed ? this.asyncFn : this.asyncFnFail
    )

    customLoading = (defaultLoading) => {
        this.setState({ countdown: true });
        defaultLoading();
    }

    customDone = (defaultDone) => {
        this.setState({ countdown: false });
        defaultDone();
    }

    loadPersonList = () => (
        this.state.personIdList.map(id => () => this.props.getSwapiPerson(id))
    )

    render() {
        const { countdown, personIdList, waitTime } = this.state;
        const { app, location } = this.props;
        const fn = this.useFn();
        const loadList = this.loadPersonList();

        let path = location.pathname === '/' ? '' : location.pathname;
        path = path[path.length - 1] === '/' ? path.slice(path.length - 1) : path;

        return (
            <React.Fragment>
                {app.error && <NotificationBar />}

                <div className="content page">
                    <h2>Timeout</h2>

                    <div className="content inner">
                        <TimeoutForm
                            {...this.state}
                            setWaitTime={this.setWaitTime}
                            setSucceed={this.setSucceed}
                        />

                        <PreloadLink to={`${path}/page2`} load={fn}>
                            <p>Link</p>
                        </PreloadLink>

                        <PreloadLink
                            to={`${path}/page2`}
                            load={fn}
                            setLoading={this.customLoading}
                            setSuccess={this.customDone}
                            setFailed={this.customDone}
                        >
                            <p>Advanced link</p>
                        </PreloadLink>

                        {countdown && <Countdown count={waitTime.value / 1000} />}
                    </div>

                    <h2>Fetch</h2>

                    <div className="content inner">
                        <FetchForm personIdList={personIdList} setPersonId={this.setPersonId} />

                        <button disabled={personIdList.length === 0}>
                            <PreloadLink
                                to={`${path}/profile/${personIdList}`}
                                load={loadList}
                            >
                                To Star Wars person page
                            </PreloadLink>
                        </button>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

Home.propTypes = {
    app: PT.shape({
        loading: PT.bool,
        error: PT.bool,
    }),
    setLoading: PT.func,
    setFailed: PT.func,
    setSuccess: PT.func,
    getSwapiPerson: PT.func,
};

const mapStateToProps = (state) => ({
    app: state.app,
});

export default connect(
    mapStateToProps,
    { setLoading, setFailed, setSuccess, getSwapiPerson },
)(Home);
