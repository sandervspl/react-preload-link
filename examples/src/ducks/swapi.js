import { PRELOAD_FAIL } from 'react-preload-link';
import * as app from './app';

// action constants
export const LOADING = 'swapi/LOADING';
export const FAIL = 'swapi/FAIL';
export const SUCCESS = 'swapi/SUCCESS';

// state
export const initialState = {
    loading: false,
    error: false,
    success: false,
    people: [],
};

// reducer
/* eslint-disable indent */
export default (state = initialState, action = {}) => {
    switch (action.type) {
        case LOADING: {
            return {
                ...state,
                loading: true,
                error: false,
                success: false,
                people: [],
            };
        }

        case FAIL: {
            return {
                ...state,
                loading: false,
                error: true,
                success: false,
            };
        }

        case SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false,
                success: true,
                people: [...state.people, action.payload],
            };
        }

        default:
            return state;
    }
};
/* eslint-enable */

// action creators
export const setLoading = () => ({ type: LOADING });
export const setFailed = () => ({ type: FAIL });
export const setSuccess = (payload) => ({ type: SUCCESS, payload });

export const getSwapiPerson = (id) => (dispatch) => {
    dispatch(setLoading());

    return window.fetch(`https://swapi.co/api/people/${id}`)
        .then(response => response.json())
        .then(data => dispatch(setSuccess(data)))
        .catch(() => {
            dispatch(setFailed());
            return PRELOAD_FAIL; // let Preload Link know the fetch failed.
        });
};
