import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import type { Route } from '@rr-views/auth/+types/login'
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
import { PasswordService } from '~/lib/password-service.server.'
import { handlePromise } from '~/lib/utils'
import { TAB_VALUES } from './constants'
import { getUserWithRoomAndPassword } from './db-queries'

const formSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Email is not valid'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
})

type FormSchema = z.infer<typeof formSchema>

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserIdFromRequest({ request })
  if (userId) return redirectAuthUserToRoom({ userId })
  return null
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation()

  const [form, fields] = useForm({
    shouldValidate: 'onBlur',
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: formSchema })
    },
  })

  const isSubmitting =
    navigation.formData?.get(FORM_INTENT_KEY) === FORM_INTENT_VALUES.login

  return (
    <TabsContent value={TAB_VALUES.LOGIN} className="pt-4">
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
        <Button
          type="submit"
          disabled={isSubmitting}
          name={FORM_INTENT_KEY}
          value={FORM_INTENT_VALUES.login}
          isLoading={isSubmitting}
        >
          Login
        </Button>
      </Form>
    </TabsContent>
  )
}

// Always generic error for security reasons
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: formSchema })

  if (submission.status === 'error') return submission.reply()

  // Conform should handle the parsing for us
  // This doesn't seem to be the case however
  // Docs are outdated
  // Dug into the source code, but for now this is fine since it's getting parsed
  // ...which we can see from logging the values
  const { email, password } = submission.payload as FormSchema

  const [getUserResult, getUserError] = await handlePromise(
    getUserWithRoomAndPassword({ email })
  )

  if (
    getUserError ||
    !getUserResult.user?.password ||
    !getUserResult.user?.room
  )
    return submission.reply({
      fieldErrors: {
        email: ['Something went wrong.'],
      },
    })

  const isPasswordCorrect = await PasswordService.verifyPassword({
    password,
    storedHash: getUserResult.user.password.hash,
    storedSalt: getUserResult.user.password.salt,
  })

  console.log('isPasswordCorrect', isPasswordCorrect)

  if (!isPasswordCorrect)
    return submission.reply({
      fieldErrors: {
        email: ['Something went wrong.'],
      },
    })

  const session = await typedAuthSessionStorage.getSession()
  session.set('userId', getUserResult.user.id)

  const headers = new Headers()
  headers.set(
    COOKIE_KEYS.setCookie,
    await typedAuthSessionStorage.commitSession(session)
  )

  return redirect(
    generatePath(ROUTES.roomDetail, {
      roomCode: getUserResult.user.room.code,
    }),
    { headers }
  )
}
