import { IIssuesListState } from '../models/i-issues-list-state.model';
import * as issuesListActions from '../actions/issues-list.actions';

import { flatten, assocPath } from 'ramda';

const mergeIssuesWithParents = (parents, issues) =>
  flatten(
    parents.map(
      (parent) =>
        [ parent,
          ...issues
            .filter((issue) => issue.fields.parent && issue.fields.parent.key === parent.key),
        ],
    ),
  );

const updateOneTimeSpent = (payload) =>
  (issue: any) => issue.id === payload.id
    ? assocPath([ 'fields', 'timespent' ], issue.fields.timespent + (payload.timeSpent / 1000), issue)
    : issue;

const initialState: IIssuesListState = {
  isPending: false,
  isError: false,
  model: {},
  errors: [],
};

export function issuesListReducer(
  state: IIssuesListState,
  action: issuesListActions.IssuesListActions,
): IIssuesListState {
  switch (action.type) {
    case issuesListActions.FETCH_LIST:
      return { ...initialState, isPending: true };

    case issuesListActions.FETCH_LIST_SUCCESS:
      return { ...initialState, model: action.payload };

    case issuesListActions.FETCH_LIST_ERROR:
      return { ...initialState, isError: true };

    case issuesListActions.FETCH_MORE_LIST:
      return { ...state, isPending: true };

    case issuesListActions.FETCH_MORE_LIST_SUCCESS:
      return {
        ...state,
        isPending: false,
        model: { ...action.payload, issues: [ ...state.model.issues, ...action.payload.issues ] },
      };

    case issuesListActions.UPDATE_ONE_TIME_SPENT:
      return { ...state, model: { ...state.model, issues: state.model.issues.map(updateOneTimeSpent(action.payload)) } };

    default:
      return state;
  }
}
