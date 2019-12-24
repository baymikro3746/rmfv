import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import { Form, TextFld, TextMulti,TextSelect, TextSwitch,TextCheck } from './../src/Rmfv'
import { MenuItem, Button }  from '@material-ui/core/'

const validations = {
  username: [
    {
      rule: 'isLength',
      args: { min: 1 },
      invalidFeedback: 'Please provide a username'
    },
    {
      rule: 'isLength',
      args: { min: 4, max: 32 },
      invalidFeedback: 'Username must be minimum 4, maximum 32 characters'
    }
  ],
  aciklama: [
    {
      rule: 'isLength',
      args: { min: 1 },
      invalidFeedback: 'Boş Gecilemez'
    }
  ],
  gorevi: [
    {
      rule: 'isLength',
      args: { min: 1 },
      invalidFeedback: 'Boş Gecilemez'
    }
  ],
  Switch: [
    {
      rule: 'equals',
      args: 'on',
      invalidFeedback: 'Please check'
    }
  ],
  Check: [
    {
      rule: 'equals',
      args: 'on',
      invalidFeedback: 'Please check'
    }
  ],
}

const App = () => {

	const [switched, setSwitched] = useState('off')
	const [checked, setChecked] = useState('on')

  const preSubmit = (res) => {
    console.log('preSubmit', res)
  }

  const onSubmit = (res) => {
    console.log('onSubmit', res)
  }

  const postSubmit = (res) => {
    console.log('postSubmit', res)

    if (res.data.success) {
      res.setItems({})
    }
  }

  const postOptions = {
    method: 'post',
    url: 'https://rfv-demo-backend-kb3ppjk4g0ol.runkit.sh/test'
  }

  return (
    <Form
      preSubmit={preSubmit}
      onSubmit={onSubmit}
      postSubmit={postSubmit}
      postOptions={postOptions}>
      <h2>Demo Form</h2>

      <div>Type "john" into username to see the backend error.</div>

      <br />

      <div>
        <TextFld
        	fullWidth
        	id="username"
          variant="outlined"
          name='username'
          label='Username'
          validations={validations.username} />
      </div>

      <br />

      <div>
        <TextMulti
        	fullWidth
        	id="aciklama"
        	rows="4"
          variant="outlined"
          name='aciklama'
          label='Aciklama'
          validations={validations.aciklama} />
      </div>

       <br />

      <div>
        <TextSelect
          fullWidth
        	id="gorevi"
          select
          label="Görevini Seçiniz"
          name="gorevi"
          variant="outlined"
          validations={validations.gorevi} 
        >
          <MenuItem value="1">Evet</MenuItem>
          <MenuItem value="2">Hayır</MenuItem>
        </TextSelect>
      </div>

      <br />

      <div>
        <TextSwitch
        	id="switch"
        	color="primary" 
        	value={switched}
        	validations={validations.Switch} 
        	name="switch">
          <label
          	label="Switch"/>
        </TextSwitch>
      </div>

      <br />

      <div>
        <TextCheck
        	id="checked"
          color="primary" 
          value={checked}
          validations={validations.Check} 
          name="Checked">
          <label
            label="Checked"/>
        </TextCheck>
      </div>

      <Button type="submit" variant="contained" color="primary">
			  Gönder
			</Button>
    </Form>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
