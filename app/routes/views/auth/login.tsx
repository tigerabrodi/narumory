import { Form } from 'react-router'
import { InputWithFeedback } from '~/components/input-with-feedback'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { TabsContent } from '~/components/ui/tabs'

export default function Login() {
  return (
    <TabsContent value="login" className="py-4">
      <Form className="flex flex-col gap-10" method="post">
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="email">Email</Label>
          <InputWithFeedback
            id="email"
            placeholder="naruto@konoha.com"
            type="email"
            name="email"
            errorMessage="Email is required"
            isError
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="password">Password</Label>
          <InputWithFeedback
            id="password"
            type="password"
            name="password"
            placeholder="********"
            helperText="Password must be at least 6 characters long"
          />
        </div>
        <Button>Login</Button>
      </Form>
    </TabsContent>
  )
}
