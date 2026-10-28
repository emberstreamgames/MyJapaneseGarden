import { mount } from 'svelte'
import '../app.css'
import PaletteLab from './PaletteLab.svelte'

mount(PaletteLab, { target: document.getElementById('app')! })
