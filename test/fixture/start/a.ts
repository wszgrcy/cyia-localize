import { $localize } from '../../../src';
let hello='hello'
function test(){return ''}
$localize`\thello`
$localize`hello`
$localize`hello${'world'}`
$localize`${'hello'}world3`
$localize`${'hello'}${'world'}`
$localize`${hello}world2`
$localize`${hello as any}world`
$localize`${test()}world1`