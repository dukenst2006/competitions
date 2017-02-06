<?php namespace App\Http\Requests\Messages;

use App\Http\Requests\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class UserStoreMessage
 * @package App\Http\Requests\Messages
 */
class UserStoreMessage extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * @return bool
     */
    public function authorize()
    {
        return \Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     * @return array
     */
    public function rules()
    {
        return [
            'subject' => ['required'],
            'body' => ['required'],
            'importance_level' => [Rule::in(range(1, 10))],
            'to' => ['required', Rule::exists('users', 'id')]
        ];
    }
}