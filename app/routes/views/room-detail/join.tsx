import { getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import type { Route } from '@rr-views/room-detail/+types/join'
import {
  Form,
  generatePath,
  redirect,
  useNavigate,
  useNavigation,
} from 'react-router'
import { z } from 'zod'
import { InputWithFeedback } from '~/components/input-with-feedback'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import { requireAuth } from '~/lib/auth.server'
import { FORM_INTENT_KEY, FORM_INTENT_VALUES, ROUTES } from '~/lib/constants'
import { getRoomWithOwner } from './lib/db-queries'

const formSchema = z.object({
  roomCode: z.string({ required_error: 'Room code is required' }),
  [FORM_INTENT_KEY]: z.enum([FORM_INTENT_VALUES.joinRoom]),
})

type FormSchema = z.infer<typeof formSchema>

export default function Join({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate()
  const navigation = useNavigation()

  const isSubmitting =
    navigation.formData?.get(FORM_INTENT_KEY) === FORM_INTENT_VALUES.joinRoom

  console.log('actionData', actionData)

  const [form, fields] = useForm({
    shouldValidate: 'onBlur',
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: formSchema })
    },
  })

  return (
    <Dialog open onOpenChange={() => void navigate('..')}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
        </DialogHeader>
        <Form
          className="flex flex-col gap-10 pt-4"
          method="post"
          id={form.id}
          onSubmit={form.onSubmit}
          noValidate
        >
          <div className="flex flex-col gap-4">
            <Label htmlFor={fields.roomCode.id}>Room Code</Label>
            <InputWithFeedback
              {...getInputProps(fields.roomCode, { type: 'text' })}
              placeholder="Enter room code..."
              errorMessage={fields.roomCode.errors?.[0]}
              isError={!!fields.roomCode.errors}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            name={FORM_INTENT_KEY}
            value={FORM_INTENT_VALUES.joinRoom}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Join Room
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export async function action({ request }: Route.ActionArgs) {
  const requireAuthResult = await requireAuth({ request })
  if (requireAuthResult.type === 'redirect') throw requireAuthResult.response

  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: formSchema })

  if (submission.status === 'error') return submission.reply()

  const { roomCode } = submission.payload as FormSchema

  const room = await getRoomWithOwner({
    roomCode,
  })

  if (!room)
    return submission.reply({
      fieldErrors: { roomCode: ['Room not found'] },
    })

  return redirect(generatePath(ROUTES.roomDetail, { roomCode: room.code }))
}
