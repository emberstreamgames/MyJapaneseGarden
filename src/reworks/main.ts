import { mount } from 'svelte'
import '../app.css'
import './lab.css'
import ReworkLab from './ReworkLab.svelte'

mount(ReworkLab, { target: document.getElementById('app')! })
