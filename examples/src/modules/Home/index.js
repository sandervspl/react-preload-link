import React from 'react';
import PT from 'prop-types';
import PreloadLink from 'react-preload-link';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { setSuccess, setLoading, setFailed, getSwapiPerson } from '../../ducks/app';

import TimeoutForm from './components/TimeoutForm';
import NotificationBar from './components/NotificationBar';
import FetchForm from './components/FetchForm';
import InlineContent from '../InlineContent';

class Home extends React.Component {
    state = {
        waitTime: {
            id: 'waitTime1000',
            value: 1000,
        },
        succeed: true,
        personId: '1',
        message: '',
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
        const { value } = e.currentTarget;

        this.setState((state) => ({
            ...state,
            personId: value,
        }));
    }

    asyncFn = () => (
        new Promise((resolve) => setTimeout(() => resolve(), this.state.waitTime.value))
    )

    asyncFnFail = () => (
        new Promise((_, reject) => setTimeout(() => reject(), this.state.waitTime.value))
    )

    useFn = () => (
        this.state.succeed ? this.asyncFn : this.asyncFnFail
    )

    customLoading = (defaultLoading) => {
        this.setState({ message: 'Loading...' });
        defaultLoading();
    }

    customDone = (defaultDone) => {
        this.setState({ message: '' });
        defaultDone();
    }

    render() {
        const { message, personId } = this.state;
        const { app } = this.props;
        const fn = this.useFn();

        return (
            <div>
                {app.error && (<NotificationBar />)}

                <div className="content">
                    <h1>Preload Link Examples</h1>

                    <h2>Timeout</h2>

                    <PreloadLink to="/inline-content" load={fn}>
                        <p>Simple link</p>
                    </PreloadLink>

                    <PreloadLink
                        to="/inline-content"
                        load={fn}
                        setSuccess={this.customDone}
                        setFailed={this.customDone}
                        setLoading={this.customLoading}
                    >
                        <p>Complex link with custom lifecycle methods</p>
                    </PreloadLink>

                    {message && <p>{message}</p>}

                    <TimeoutForm
                        {...this.state}
                        setWaitTime={this.setWaitTime}
                        setSucceed={this.setSucceed}
                    />

                    <Route path="/inline-content" component={InlineContent} />

                    <h2>Fetch</h2>

                    <PreloadLink
                        to={`/profile/${personId}`}
                        load={() => this.props.getSwapiPerson(personId)}
                    >
                        <p>To Star Wars person page</p>
                    </PreloadLink>

                    <FetchForm personId={personId} setPersonId={this.setPersonId} />
                </div>
            </div>
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
