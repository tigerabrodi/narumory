import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import type { Route } from '@rr-views/auth/+types/register'
import { Form, generatePath, redirect, useNavigation } from 'react-router'
import { z } from 'zod'
import { InputWithFeedback } from '~/components/input-with-feedback'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { TabsContent } from '~/components/ui/tabs'
import {
  getUserIdFromRequest,
  redirectAuthUserToRoom,
  typedAuthSessionStorage,
} from '~/lib/auth.server'
import {
  COOKIE_KEYS,
  FORM_INTENT_KEY,
  FORM_INTENT_VALUES,
  ROUTES,
} from '~/lib/constants'
import { runAsync } from '~/lib/utils'
import { TAB_VALUES } from './constants'
import { createUser, getUserByEmailOrUsername } from './db-queries'

const formSchema = z
  .object({
    [FORM_INTENT_KEY]: z.literal(FORM_INTENT_VALUES.register),
    username: z
      .string({ required_error: 'Username is required' })
      .min(3, 'Username must be at least 3 characters long'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required' })
      .min(6, 'Password must be at least 6 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type FormSchema = z.infer<typeof formSchema>

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserIdFromRequest({ request })
  if (userId) return redirectAuthUserToRoom({ userId })
  return null
}

export default function Register({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation()

  const [form, fields] = useForm({
    shouldValidate: 'onBlur',
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: formSchema })
    },
  })

  const isSubmitting =
    navigation.formData?.get(FORM_INTENT_KEY) === FORM_INTENT_VALUES.register

  return (
    <TabsContent value={TAB_VALUES.REGISTER} className="pt-4">
      <Form
        className="flex flex-col gap-9"
        method="post"
        id={form.id}
        onSubmit={form.onSubmit}
        noValidate
      >
        <div className="flex flex-col gap-2.5">
          <Label htmlFor={fields.email.id}>Email</Label>
          <InputWithFeedback
            key={fields.email.key}
            name={fields.email.name}
            id={fields.email.id}
            placeholder="naruto@konoha.com"
            type="email"
            errorMessage={fields.email.errors?.[0]}
            isError={!!fields.email.errors}
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor={fields.username.id}>Username</Label>
          <InputWithFeedback
            key={fields.username.key}
            name={fields.username.name}
            id={fields.username.id}
            errorMessage={fields.username.errors?.[0]}
            isError={!!fields.username.errors}
            placeholder="Naruto"
            helperText="Username must be at least 3 characters long"
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor={fields.password.id}>Password</Label>
          <InputWithFeedback
            key={fields.password.key}
            name={fields.password.name}
            id={fields.password.id}
            errorMessage={fields.password.errors?.[0]}
            isError={!!fields.password.errors}
            type="password"
            helperText="Password must be at least 6 characters long"
            placeholder="********"
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor={fields.confirmPassword.id}>Confirm Password</Label>
          <InputWithFeedback
            key={fields.confirmPassword.key}
            name={fields.confirmPassword.name}
            id={fields.confirmPassword.id}
            errorMessage={fields.confirmPassword.errors?.[0]}
            isError={!!fields.confirmPassword.errors}
            type="password"
            placeholder="********"
          />
        </div>
        <Button
          type="submit"
          name={FORM_INTENT_KEY}
          value={FORM_INTENT_VALUES.register}
          disabled={isSubmitting}
        >
          Register
        </Button>
      </Form>
    </TabsContent>
  )
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: formSchema })

  if (submission.status === 'error') return submission.reply()

  // Conform should handle the parsing for us
  // This doesn't seem to be the case however
  // Docs are outdated
  // Dug into the source code, but for now this is fine since it's getting parsed
  // ...which we can see from logging the values
  const { username, email, password } = submission.payload as FormSchema

  const [getUserResult, getUserError] = await runAsync(
    getUserByEmailOrUsername,
    {
      email,
      username,
    }
  )

  if (getUserError) throw new Error('Connection to database failed')

  if (getUserResult.existingUser) {
    const isSameUserName = getUserResult.existingUser.username === username

    if (isSameUserName)
      return submission.reply({
        fieldErrors: { username: ['Username already exists'] },
      })

    return submission.reply({
      fieldErrors: { email: ['Email already exists'] },
    })
  }

  const [createUserResult, error] = await runAsync(createUser, {
    username,
    email,
    password,
  })

  if (error || !createUserResult?.user?.room)
    return submission.reply({
      fieldErrors: {
        email: ['Failed to create user, please try again later.'],
      },
    })

  const session = await typedAuthSessionStorage.getSession()
  session.set('userId', createUserResult.user.id)

  const headers = new Headers()
  headers.set(
    COOKIE_KEYS.setCookie,
    await typedAuthSessionStorage.commitSession(session)
  )

  return redirect(
    generatePath(ROUTES.roomDetail, {
      roomCode: createUserResult.user.room.code,
    }),
    {
      headers,
    }
  )
}
