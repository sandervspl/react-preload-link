import Progress from 'react-progress-2';
import { PRELOAD_FAIL } from 'react-preload-link';

// action constants
export const LOADING = 'app/LOADING';
export const FAIL = 'app/FAIL';
export const SUCCESS = 'app/SUCCESS';
export const FETCH_SUCCESS = 'app/FETCH_SUCCESS';

// state
export const initialState = {
    loading: false,
    error: false,
    success: false,
    person: null,
};

// reducer
/* eslint-disable indent */
export default (state = initialState, action = {}) => {
    switch (action.type) {
        case LOADING: {
            if (!state.loading) Progress.show();

            return {
                ...state,
                loading: true,
                error: false,
                success: false,
            };
        }

        case FAIL: {
            Progress.hideAll();

            return {
                ...state,
                loading: false,
                error: true,
                success: false,
            };
        }

        case SUCCESS: {
            Progress.hideAll();

            return {
                ...state,
                loading: false,
                error: false,
                success: true,
            };
        }

        case FETCH_SUCCESS:
            Progress.hideAll();

            return {
                ...state,
                person: action.payload,
            };

        default:
            return state;
    }
};
/* eslint-enable */

// action creators
export const setLoading = () => ({ type: LOADING });
export const setFailed = () => ({ type: FAIL });
export const setSuccess = () => ({ type: SUCCESS });
export const fetchPersonSuccess = (payload) => ({ type: FETCH_SUCCESS, payload });

export const getSwapiPerson = (id = 1) => (dispatch) => {
    dispatch(setLoading());

    return window.fetch(`https://swapi.co/api/people/${id}`)
        .then(response => response.json())
        .then(data => dispatch(fetchPersonSuccess(data)))
        .catch(() => {
            dispatch(setFailed());
            return PRELOAD_FAIL; // let Preload Link know the fetch failed.
        });
};
