import { Form } from 'react-router'
import { InputWithFeedback } from '~/components/input-with-feedback'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { TabsContent } from '~/components/ui/tabs'

export default function Register() {
  return (
    <TabsContent value="register" className="py-4">
      <Form className="flex flex-col gap-10" method="post">
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="email">Email</Label>
          <InputWithFeedback
            id="email"
            placeholder="naruto@konoha.com"
            name="email"
            type="email"
            errorMessage="Email is required"
            isError
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="username">Username</Label>
          <InputWithFeedback
            id="username"
            placeholder="Naruto"
            name="username"
            helperText="Username must be at least 3 characters long"
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="password">Password</Label>
          <InputWithFeedback
            id="password"
            type="password"
            name="password"
            helperText="Password must be at least 6 characters long"
            placeholder="********"
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="confirm">Confirm Password</Label>
          <InputWithFeedback
            id="confirm"
            type="password"
            name="confirmPassword"
            placeholder="********"
          />
        </div>
        <Button>Register</Button>
      </Form>
    </TabsContent>
  )
}
