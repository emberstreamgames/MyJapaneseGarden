import { mount } from 'svelte'
import '../app.css'
import CreatureLab from './CreatureLab.svelte'

mount(CreatureLab, { target: document.getElementById('app')! })
