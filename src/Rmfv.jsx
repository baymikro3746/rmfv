import React, { Fragment, useEffect, useState } from 'react'
import validator from 'validator'
import axios from 'axios'
import {
	TextField,
	MenuItem,
	FormControl,
	FormControlLabel,
	FormHelperText,
	FormGroup,
	Switch,
	Checkbox
	} from '@material-ui/core'

const Form = (props) => {
  const { runValidation, preSubmit, onSubmit, postSubmit, postOptions, store, ...htmlProps } = props

  useEffect(() => {
    store.runValidation(runValidation)
  }, [runValidation])

  return (
    <form
      noValidate
      {...htmlProps}
      onSubmit={(e) => store.formOnSubmit({ preSubmit, onSubmit, postSubmit, postOptions }, e)}>
      {props.children}
    </form>
  )
}

const Item = (props) => {
  const { opts, store, validations, className, onChange, ...htmlProps } = props

  useEffect(() => {
    store.itemInitialize(props)
  }, [props.value])

  const thisItem = store.state.items[props.name] || {
    value: '',
    className: '',
    invalidFeedback: ''
  }

  const itemClassName = (className || '') + (thisItem.className ? (className ? ' ' : '') + thisItem.className : '')

  let formElement
  if (opts.element === 'textField') {
    formElement = (
      <TextField
        {...htmlProps}
        value={thisItem.value}
        onChange={e => store.itemOnChange({ props, e, onChange })} 
        helperText={thisItem.invalidFeedback ? thisItem.invalidFeedback : null}
        error={thisItem.invalidFeedback ? 'error' : null}/>
    )
  } else if (opts.element === 'textarea') {
    formElement = (
      <TextField
        {...htmlProps}
        multiline
        variant="outlined"
        value={thisItem.value}
        onChange={e => store.itemOnChange({ props, e, onChange })} 
        helperText={thisItem.invalidFeedback ? thisItem.invalidFeedback : null}
        error={thisItem.invalidFeedback ? 'error' : null}/>
    )
  } else if (opts.element === 'select') {
    formElement = (
      <TextField
        {...htmlProps}
        value={thisItem.value}
        onChange={e => store.itemOnChange({ props, e, onChange })}
        helperText={thisItem.invalidFeedback ? thisItem.invalidFeedback : null}
        error={thisItem.invalidFeedback ? 'error' : null}>
        {props.children}
      </TextField>
    )
  } else if(opts.element === 'switch'){
		formElement = (
			<FormControl component="fieldset">
	      <FormGroup>
	        <FormControlLabel
	          {...props.children.props}
		        control={
		        	<Switch 
		        	{...htmlProps} 
		        	value={thisItem.value}
		        	checked={thisItem.value === 'on'}
		        	onChange={e => store.itemOnChange({ props, e, onChange })}/>
		        }
	        />
	      </FormGroup>
	      {thisItem.invalidFeedback ? (<FormHelperText error="error" style={{marginLeft:'13px'}}>{thisItem.invalidFeedback}</FormHelperText>) : null}
    	</FormControl>
    )
  } else if(opts.element === 'checked'){
  	formElement = (
			<FormControl component="fieldset">
	      <FormGroup>
	        <FormControlLabel
	          {...props.children.props}
		        control={
		        	<Checkbox 
		        	{...htmlProps} 
		        	value={thisItem.value}
		        	checked={thisItem.value === 'on'}
		        	onChange={e => store.itemOnChange({ props, e, onChange })}/>
		        }
	        />
	      </FormGroup>
	      {thisItem.invalidFeedback ? (<FormHelperText error="error" style={{marginLeft:'13px'}}>{thisItem.invalidFeedback}</FormHelperText>) : null}
    	</FormControl>
    )
  }

  return (
    <Fragment>
      {formElement}
    </Fragment>
  )
}

const TextFld = (props) => <Item {...props} opts={{ element: 'textField' }} />
const TextMulti = (props) => <Item {...props} opts={{ element: 'textarea' }} />
const TextSelect = (props) => <Item {...props} opts={{ element: 'select' }} />
const TextSwitch = (props) => <Item {...props} opts={{ element: 'switch' }} />
const TextCheck = (props) => <Item {...props} opts={{ element: 'checked' }} />

const Context = React.createContext()

const Provider = (props) => {
  const [items, setItems] = useState({})
  const [interestingBug, setInterestingBug] = useState('')
  const [formIsValidating, setFormIsValidating] = useState(false)

  const itemValidate = (opts) => {
    const item = items[opts.name]

    item.validations.map((itemValidation, i) => {
      const validate = validator[itemValidation.rule](item.value, itemValidation.args)
      if (validate) {
        itemValidation.validated = true
      } else {
        itemValidation.validated = false
      }
    })

    const unvalidatedItems = []
    item.validations.map((itemValidation, i) => {
      if (!itemValidation.validated) {
        unvalidatedItems.push(itemValidation)
      }
    })

    item.validated = !unvalidatedItems.length || false
  }

  const formUnvalidate = () => {
    Object.keys(items).map((key) => {
      const item = items[key]
      item.className = ''
    })
    setItems(items)
  }

  const formValidate = () => {
    let howManyItemsValidated = 0
    let howManyItemsAreGonnaValidate = 0

    Object.keys(items).map((key) => {
      const item = items[key]

      item.validations.map((itemValidation, i) => {
        howManyItemsAreGonnaValidate++

        const validate = validator[itemValidation.rule](item.value, itemValidation.args)
        if (validate) {
          itemValidation.validated = true
          howManyItemsValidated++
        } else {
          itemValidation.validated = false
        }
      })

      const unvalidatedItems = []
      item.validations.map((itemValidation, i) => {
        if (!itemValidation.validated) {
          unvalidatedItems.push(itemValidation)
        }
      })

      if (unvalidatedItems.length) {
        item.invalidFeedback = unvalidatedItems[0].invalidFeedback
        item.className = 'is-invalid'
      }
    })

    setItems(items)

    return howManyItemsAreGonnaValidate === howManyItemsValidated || false
  }

  const formOnSubmit = (opts, e) => {
    e.preventDefault()

    if (opts.preSubmit) {
      opts.preSubmit({
        e,
        setItems: itemSet,
        items: itemsAndValues()
      })
    }

    setFormIsValidating(true)

    const isFormValid = formValidate()

    if (opts.onSubmit) {
      opts.onSubmit({
        e,
        setItems: itemSet,
        items: itemsAndValues(),
        isFormValid: isFormValid
      })
    }

    if (isFormValid && opts.postOptions) {
      opts.postOptions.data = itemsAndValues()

      axios({...opts.postOptions})
        .then((res) => {
          const validations = res.data.validations || {}

          let isPostSubmitFormValid = true
          if (Object.keys(validations).length) {
            isPostSubmitFormValid = false

            Object.keys(validations).map((key) => {
              items[key].invalidFeedback = validations[key]
              items[key].className = 'is-invalid'
            })

            const newItems = Object.assign({}, items)
            setItems(newItems)
          }

          if (opts.postSubmit) {
            opts.postSubmit({
              e,
              isFormValid,
              data: res.data,
              setItems: itemSet,
              isPostSubmitFormValid,
              items: itemsAndValues()
            })
          }
        })
        .catch((err) => {
          if (opts.postSubmit) {
            opts.postSubmit({
              error: err,
              isFormValid,
              setItems: itemSet,
              items: itemsAndValues()
            })
          }
        })
    }
  }

  const itemsAndValues = () => {
    const data = {}

    Object.keys(items).map((key) => {
      const item = items[key]
      data[key] = item.value
    })

    return data
  }

  const itemInitialize = (item) => {
  	console.log(item.checked)
    let itemValue = item.value || ''
    if (item.opts.element === 'switch') {
      if (Object.prototype.hasOwnProperty.call(item, 'checked')) {
        itemValue = item.checked ? 'on' : 'off'
      }
    }

    if (item.opts.element === 'checked') {
      if (Object.prototype.hasOwnProperty.call(item, 'checked')) {
        itemValue = item.checked ? 'on' : 'off'
      }
    }

    items[item.name] = {
      value: itemValue,
      validations: item.validations || []
    }

    setInterestingBug(itemValue)

    const newItems = Object.assign({}, items)
    setItems(newItems)

    if (formIsValidating) formValidate()

    	console.log(itemValue)
  }

  const itemOnChange = (opts) => {
    const item = {
      ...opts.props,
      checked: opts.e.target.checked,
      value: opts.e.target.value
    }

    itemInitialize(item)

    if (opts.onChange) {
      itemValidate({ name: opts.props.name })
      opts.onChange({ e: opts.e, validated: items[opts.props.name].validated })
    }
  }

  const itemSet = (opts) => {
    if (opts) {
      const optsKeys = Object.keys(opts)
      const itemKeys = Object.keys(items)

      if (optsKeys.length) {
        itemKeys.map((key) => {
          const item = items[key]

          if (opts.hasOwnProperty(key)) {
            item.value = opts[key]
          }
        })
      } else {
        itemKeys.map((key) => {
          const item = items[key]
          item.value = ''
        })
      }

      setItems(items)
    }
  }

  const runValidation = (trueFalse) => {
    setFormIsValidating(trueFalse)
    if (trueFalse) {
      formValidate()
    } else {
      formUnvalidate()
    }
  }

  const store = {
    formOnSubmit,
    itemInitialize,
    itemOnChange,
    runValidation,
    setItems: itemSet,
    state: { items }
  }

  return (
    <Context.Provider value={store}>
      {props.children}
    </Context.Provider>
  )
}

const connectProvider = (Component) => {
  return (props) => (
    <Provider>
      <Context.Consumer>
        {(store) => <Component {...props} store={store} />}
      </Context.Consumer>
    </Provider>
  )
}

const connectConsumer = (Component) => {
  return (props) => (
    <Context.Consumer>
      {(store) => <Component {...props} store={store} />}
    </Context.Consumer>
  )
}

module.exports = {
  Form: connectProvider(Form),
  TextFld: connectConsumer(TextFld),
  TextMulti: connectConsumer(TextMulti),
  TextSelect: connectConsumer(TextSelect),
  TextSwitch: connectConsumer(TextSwitch),
  TextCheck: connectConsumer(TextCheck)
}
